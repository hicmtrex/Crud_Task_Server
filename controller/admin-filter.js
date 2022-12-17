
exports.filter = (req , res , next) => {
    let queries = req.query,
    filteration = {};
    Object.entries(queries).forEach(([key , value]) => {
        if(value && key !== 'page' && key !== "limit") {
            if(key == "keyword") {
                filteration['title'] ={$regex: value }
            }else if(key == "fromDate" || key == "toDate") {
                filteration['deadline'] = {
                    $gte:queries['fromDate'],
                    $lte:queries['toDate'],
                }
            }else {
                filteration[key] = value
            }
        }
    })
    res.locals.filter = filteration
    next()
}