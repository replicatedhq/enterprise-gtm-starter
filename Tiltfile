# vi: set ft=python

overlay = local('if [ -d kustomize/overlays/dev_$USER ]; then printf "dev_$USER"; else printf "dev"; fi')
k8s_yaml(kustomize("./kustomize/overlays/%s" % overlay))

repo = local_git_repo(".")

def nodejs_build(image_name, entrypoint, paths):
    img = fast_build(image_name, 'Dockerfile.node', entrypoint)

    for path in ['package.json', 'package-lock.json', 'tslint.json', 'tsconfig.json']:
        img.add(repo.path(path), '/app/%s' % path)

    for path in paths:
        img.add(repo.path(path), '/app/%s' % path)

    img.run('npm install', trigger=['package.json', 'package-lock.json'])
    return img

nodejs_build('backend', 'npm run --silent start-backend', [
    'src/server',
    'src/vendorclient',
])

nodejs_build('frontend', 'npm run --silent start-fe', [
    'src/index.js',
    'src/client',
    'public',
]).hot_reload()

nodejs_build('unittests', 'npm run --silent test', [
    'src/server',
    'src/vendorclient',
    'test',
])

nodejs_build('lint', 'npm run --silent tslint:watch', [
    'src/',
]).hot_reload()

nodejs_build('integrationtest', 'npm run --silent integration-test', [
    'src/integrationtest',
    'src/server',
    'src/vendorclient',
    'test',
])
