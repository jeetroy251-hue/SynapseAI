import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getFromS3=async(filename,expiresIn=600,downloadName)=>{
    const commandParams={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:filename
    }
    if(downloadName){
        commandParams.ResponseContentDisposition=`attachment; filename="${downloadName}"`
    }
    return await getSignedUrl(
        s3,
        new GetObjectCommand(commandParams),
        {expiresIn}
    )
}