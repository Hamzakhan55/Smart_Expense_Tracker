from services.ai_processor_local import ai_processor

tests = [
    'going from Peshawar to Islamabad I spent 5000',
    'buy medicine for Rs 3000'
]

for test in tests:
    result = ai_processor.classify_text(test)
    amount = ai_processor.extract_amount(test)
    print(f'Input: {test}')
    print(f'Category: {result}')
    print(f'Amount: {amount}')
    print('---')