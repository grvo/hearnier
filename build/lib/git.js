// variáveis de dependências
var path = require('path');
var fs = require('fs');

exports.getVersion = function (repo) {
    var git = path.join(repo, '.git');
    var headPath = path.join(git, 'HEAD');
    
    var head;

    try {
        head = fs.readFileSync(headPath, 'utf8').trim();
    } catch (e) {
        return void 0;
    }

    if (/^[0-9a-f]{40}$/i.test(head)) {
        return head;
    }

    var refMatch = /^ref: (.*)$/.exec(head);

    if (!refMatch) {
        return void 0;
    }

    var ref = refMatch[1];
    var refPath = path.join(git, ref);

    try {
        return fs.readFileSync(refPath, 'utf8').trim();
    } catch (e) {
        // nada
    }

    var packedRefsPath = path.join(git, 'packed-refs');
    var refsRaw;

    try {
        refsRaw = fs.readFileSync(packedRefsPath, 'utf8').trim();
    } catch (e) {
        return void 0;
    }

    var refsRegex = /^([0-9a-f]{40})\s+(.+)$/gm;
    var refsMatch;
    var refs = {};

    while (refsMatch = refsRegex.exec(refsRaw)) {
        refs[refsMatch[2]] = refsMatch[1];
    }

    return refs[ref];
};
