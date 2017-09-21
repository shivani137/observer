export function isObject(x) {
    return x != null && typeof x === 'object';
}

export function getObject(ctx, root = {}) {
    if(!ctx || isObject(ctx)){
        return ctx;
    }
    let clonedCtx = JSON.parse(JSON.stringify(ctx));
    for (var i in clonedCtx) {
        if (typeof clonedCtx[i] !== "object") {
            root[i] = clonedCtx[i]
        } else if (typeof clonedCtx[i] === "object" && typeof clonedCtx[i].___value !== "undefined") {
            root[i] = clonedCtx[i].___value;
        } else if (Array.isArray(clonedCtx[i])) {
            root[i] = clonedCtx[i].splice(0);
        } else if (typeof clonedCtx[i] === "object") {
            root[i] = getObject(clonedCtx[i], {})
        }
    }
    return root;
}