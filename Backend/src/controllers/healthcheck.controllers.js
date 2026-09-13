import {Apiresponse} from "../utils/api-response.js"


const healthCheck = (req,res) => {
    res.status(200).json(
        new Apiresponse(200,{
            message:"server is running"
        })
    )
}

export {healthCheck};