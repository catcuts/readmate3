# pip install googletranslatepy
import os
import json
from googletranslatepy import Translator
import deep_translator

root_path = r'../src/_locales'

source_lang = 'en'

with open(os.path.join(root_path, source_lang, 'messages.json'), 'r') as f:
    source_lang_data = f.read()

source_lang_data = json.loads(source_lang_data)

with open(os.path.join(root_path, source_lang, 'desc.txt'), 'r') as f:
    source_desc_data = f.readlines()


# 这里有113种语言，chrome插件不支持那么多语言
codes =  deep_translator.constants.GOOGLE_LANGUAGES_TO_CODES
codes = ['sq', 'ar', 'hy', 'bn', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da', 'nl', 'en', 'et', 'fr', 'fi', 'de', 'el', 'he', 'hu', 'is', 'hi', 'id', 'it', 'ja', 'ko', 'lv', 'lt', 'mk', 'ms', 'no', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sv', 'ta', 'th', 'tr', 'uk', 'ur', 'vi']

for target_lang in codes.values():

    try:
        dir_path = os.path.join(root_path, target_lang)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)

        # use a http proxies
        translator = Translator(
            proxies='http://127.0.0.1:7890',
            source='en',
            target=target_lang)
        target_lang_data = {}
        for k, v in source_lang_data.items():
            target_lang_data[k] = {}
            target_lang_data[k]['message'] = translator.translate(v.get('message', ''))
        with open(os.path.join(dir_path, 'messages.json'), 'w') as f:
            f.write(json.dumps(target_lang_data, indent=4, ensure_ascii=False))

        target_desc_data = []
        for t in source_desc_data:
            target_desc_data.append(translator.translate(t))
        target_desc_data = '\n'.join(target_desc_data)
        
        with open(os.path.join(dir_path, 'desc.txt'), 'w') as f:
            f.write(target_desc_data)

        print(f'{dir_path} done!')
    except:
        print(f'error lang: {target_lang}')