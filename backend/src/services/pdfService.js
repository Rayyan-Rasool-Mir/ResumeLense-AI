const {PDFParse} = require('pdf-parse');
const ApiError = require('../utils/ApiError');

async function extractText(buffer){
    let parser;
    try{
        parser = new PDFParse({data: buffer});
        const result = await parser.getText();

        const text = (result.text || "").trim();
        if(!text || text.length < 50){
            throw ApiError.badRequest("Could not extract text from the PDF file. Please ensure the PDF is not scanned or image-based.");
        }
        return{
            text,
            meta: {
                numPages: result.pages?.length ?? result.numpages ?? null,
            },
        };
    }catch(err){
        if(err.isOperational) throw err;
        throw ApiError.badRequest("Failed to parse PDF file: " + err.message);
    } finally{
        try{
            await parser?.destroy?.();
        }catch{
            /*ignore*/
        }
    }
}

module.exports = {extractText};