from langchain.llms import OpenAI
llm = OpenAI(openai_api_key="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",temperature=0.9)
text = "What would be a good company name for a company that makes colorful socks?"
print(llm(text))