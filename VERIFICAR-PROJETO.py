from pathlib import Path
import json, re
root = Path(__file__).parent
posts_txt = (root/'assets/js/posts.js').read_text(encoding='utf-8')
posts = json.loads(posts_txt.removeprefix('const POSTS = ').rstrip(';\n'))
errors=[]
for p in posts:
    if not (root/'artigos'/p['slug']/'index.html').exists(): errors.append(f"Falta artigo: {p['slug']}")
    img = root / p['image'].lstrip('/')
    if not img.exists(): errors.append(f"Falta imagem: {p['image']}")
print('Posts:', len(posts))
if errors:
    print('ERROS:')
    for e in errors: print('-', e)
else:
    print('Tudo certo: artigos e imagens encontrados.')
