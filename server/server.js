const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = 3001

//Enable cors for all the routes
app.use(cors());

app.get("/bookStream", (req, res)=>{
    const author = req.query.authors;
    const title = req.query.title;
    const year = req.query.year;
    const rating = req.query.rating;
    const pages = req.query.pages;
    const theme = req.query.theme;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendEvent = (chunk) => {
        let chunkResponse;
        if (chunk.choices[0].finish_reason === "stop"){
            res.write(`data: ${JSON.stringify({action: "close"})}\n\n`)
        } else {
            if (
                chunk.choices[0].delta.role &&
                chunk.choices[0].delta.role == "assistant"
            ) {
                chunkResponse = {
                    action: "start",
                }
            } else {
                chunkResponse = {
                    action: "chunk",
                    chunk: chunk.choices[0].delta.content,
                }
            }
            res.write(`data: ${JSON.stringify(chunkResponse)}\n\n`)
        }
    }
    
    const prompt = [];
    prompt.push("Generame una recomendacion de tres libros, que cumplan con los siguientes parametros:");
    prompt.push(`[Autor: ${author}]`);
    prompt.push(`[Similar al libros: ${title}]`);
    prompt.push(`[Año: ${year}]`);
    prompt.push(`[Puntuacion: ${rating}]`);
    prompt.push(`[Cantidad de paginas: ${pages}]`);
    prompt.push(`[Género: ${theme}]`);
    prompt.push("Por favor proporcione una descripción detallada de la trama de cada uno.");
    
    const messages = [
        {
            role: "system",
            content: prompt.join(""),
        },
    ];
    
    fetchOpenAICompletionsStream(messages, sendEvent);
    
    req.on("close", () => {
        res.end();
    });
});
    
    
   









async function fetchOpenAICompletionsStream(messages, callback){
    const OPENAI_API_KEY = "sk-proj-6UUtz80tb5uxgrFdd4ZGT3BlbkFJJbiFLoZ6VOVdz0yr5g4B";
    const openai = new OpenAI({apiKey: OPENAI_API_KEY});
    const aiModel = "gpt-3.5-turbo";

    try{
        const completion = await openai.chat.completions.create({
            model: aiModel,
            messages: messages,
            temperature: 1,
            stream: true,
        })

        for await (const chunk of completion){
            callback(chunk);
        }
    } catch(error){
        console.error("Error fetching data from OpenAI API:", error);
        throw new Error("Error fetching data from OpenAI API.");
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});