# -*- coding: utf-8 -*-
import os
import sys
from git import Repo
import shutil
import pandas as pd
import json
# reload(sys)
# sys.setdefaultencoding('utf-8')

localizable_strings_dir = 'localizable_strings'
csv_file = localizable_strings_dir + '/asimlink.csv'
shorthand = {
  'English': 'en',
  'Chinese': 'zh'
}

def git_clone_localizable_strings():
  if localizable_strings_dir in os.listdir('.'):
    shutil.rmtree(localizable_strings_dir)
  Repo.clone_from('git@gitlab.asimov.work:flow/locale.git', localizable_strings_dir)


def csv_2_json():
  df = pd.read_csv(csv_file, encoding='utf-8')
  for l, s in shorthand.items():
    result = {}
    _df = df[['Key', l]]
    _df.dropna(inplace=True)
    for index, row in _df.iterrows():
      result[row['Key'].strip()] = row[l]
    save_to_assets(s, result)

def csv_2_constants():
  df = pd.read_csv(csv_file, encoding='utf-8')
  col = df[['Key']]
  col.dropna(inplace=True)
  str = ''
  for index, row in col.iterrows():
    resName = row['Key'].strip()
    name = resName.replace('-', "_")
    name = name.replace(' ', '')
    str = str + "export const " + "i18n_" + name + " = " + "\"" + resName + "\"\n"
  save_to_tsFile('strings', str)

def save_to_assets(file_name, content):
  path = '../static/i18n'
  with open('{path}/{file}'.format(path = path, file = file_name + '.json'), 'w') as f:
    f.write(json.dumps(content, indent=2, sort_keys=True, ensure_ascii=False))

def save_to_tsFile(file_name, content):
 path = '../static/i18n'
 with open('{path}/{file}'.format(path = path, file = file_name + '.ts'), 'w') as tsfile:
    tsfile.write(content)

if __name__ == '__main__':
  git_clone_localizable_strings()
  csv_2_json()
  csv_2_constants()
