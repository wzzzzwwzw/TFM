import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

function buildOutputFormatPrompt(
  output_format: OutputFormat,
  list_output: boolean,
  dynamic_elements: boolean,
  list_input: boolean
) {
  let prompt = `\nYou are to output the following in json format: ${JSON.stringify(
    output_format
  )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

  if (list_output) {
    prompt += `\nIf output field is a list, classify output into the best element of the list.`;
  }
  if (dynamic_elements) {
    prompt += `\nAny text enclosed by s< and > indicates you must generate content to replace it.
      Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it.
       Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
  }
  if (list_input) {
    prompt += `\nGenerate a list of json, one json for each input element.`;
  }
  prompt += `\nAlways escape double quotes inside string values using a backslash (e.g., \\"). Respond ONLY with valid JSON.`;
  return prompt;
}

function normalizeOutputValue(
  value: any,
  choices: string[],
  default_category: string
) {
  if (Array.isArray(value)) {
    value = value[0];
  }
  if (default_category && !choices.includes(value)) {
    value = default_category;
  }
  if (typeof value === "string" && value.includes(":")) {
    value = value.split(":")[0];
  }
  return value;
}

function validateAndNormalizeOutput(
  output: any,
  output_format: OutputFormat,
  default_category: string,
  output_value_only: boolean,
  list_input: boolean
) {
  const outputArr = list_input ? output : [output];
  for (let index = 0; index < outputArr.length; index++) {
    for (const key in output_format) {
      if (key.includes("<") && key.includes(">")) continue;
      if (!(key in outputArr[index])) {
        throw new Error(`${key} not in json output`);
      }
      if (Array.isArray(output_format[key])) {
        outputArr[index][key] = normalizeOutputValue(
          outputArr[index][key],
          output_format[key] as string[],
          default_category
        );
      }
    }
    if (output_value_only) {
      outputArr[index] = Object.values(outputArr[index]);
      if (outputArr[index].length === 1) {
        outputArr[index] = outputArr[index][0];
      }
    }
  }
  return list_input ? outputArr : outputArr[0];
}

// Escapes unescaped double quotes inside string values in JSON arrays/objects
function escapeInnerQuotes(jsonStr: string): string {
  // This regex finds double quotes inside string values and escapes them
  // It only escapes quotes that are not already escaped and are inside value strings
  return jsonStr.replace(
    /"(.*?)":\s*"(.*?)(?<!\\)"/g,
    (match, key, value) => {
      // Escape any unescaped double quotes inside the value
      const fixedValue = value.replace(/([^\\])"/g, '$1\\"');
      return `"${key}": "${fixedValue}"`;
    }
  );
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gpt-3.5-turbo",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  const list_input = Array.isArray(user_prompt);
  const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
  const list_output = /\[.*?\]/.test(JSON.stringify(output_format));
  let error_msg = "";

  for (let i = 0; i < num_tries; i++) {
    const output_format_prompt = buildOutputFormatPrompt(
      output_format,
      list_output,
      dynamic_elements,
      list_input
    );
    const response = await openai.chat.completions.create({
      temperature,
      model,
      messages: [
        {
          role: "system",
          content: system_prompt + output_format_prompt + error_msg,
        },
        { role: "user", content: user_prompt.toString() },
      ],
    });

    let res: string =
      response.choices[0].message?.content?.replace(/'/g, '"') ?? "";
    res = res.replace(/(\w)"(\w)/g, "$1'$2").trim();

    // Try to extract JSON if extra text is present
    const firstBracket = res.indexOf("[");
    const firstBrace = res.indexOf("{");
    if (
      firstBracket !== -1 &&
      (firstBracket < firstBrace || firstBrace === -1)
    ) {
      res = res.slice(firstBracket);
    } else if (firstBrace !== -1) {
      res = res.slice(firstBrace);
    }

    // Escape inner quotes in values
    res = escapeInnerQuotes(res);

    if (verbose) {
      console.log(
        "System prompt:",
        system_prompt + output_format_prompt + error_msg
      );
      console.log("\nUser prompt:", user_prompt);
      console.log("\nGPT response:", res);
    }

    try {
      let output = JSON.parse(res);
      if (list_input && !Array.isArray(output)) {
        throw new Error("Output format not in a list of json");
      }
      return validateAndNormalizeOutput(
        output,
        output_format,
        default_category,
        output_value_only,
        list_input
      );
    } catch (e) {
      error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
      console.log("Current invalid json format:", res);
    }
  }
  return [];
}