
exports.userfilter = (req , res , next) => {
    let queries = req.query,
    filteration = {};
    Object.entries(queries).forEach(([key , value]) => {
        if(value && key !== 'page' && key !== "limit") {
            if(key == "name") {
                filteration['username'] ={$regex: value }
            }
        }
    })
    res.locals.userfilter = filteration
    next()
}