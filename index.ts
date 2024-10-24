import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs/promises'
import {PrismaClient} from '@prisma/client'

const app : express.Application = express();
const prisma : PrismaClient = new PrismaClient();

const uploadKasittelija : express.RequestHandler = multer({
    dest : path.resolve(__dirname, "tmp"),
    fileFilter : (req, file, callback) => {

        console.log(file.mimetype)
        if (["json"].includes(file.mimetype.split("/")[1])) {

            callback(null, true);

        }else {

            callback(new Error());

        }
    }
}).single("tiedosto");

const portti : number = Number(process.env.PORT) || 3001;

app.set("view engine", "ejs");

app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", async (req : express.Request, res : express.Response) => {

    res.render("index")

})

app.get("/virhe", async (req : express.Request, res : express.Response) => {

    res.render("virhe")

})



app.post("/upload", async (req : express.Request, res : express.Response) => {

    uploadKasittelija(req, res, async (err : any) => {

        if (err) {

            res.render("virhe")

        }else if (req.file) {

            let tiedostonNimi : string = `${req.file.filename}.json`
    
            await fs.copyFile(path.resolve(__dirname, "tmp", String(req.file?.filename)), path.resolve(__dirname, "public", "tiedot", tiedostonNimi))
    
            const jsonData = require(`./public/tiedot/${tiedostonNimi}`)
    
            res.render("upload", {askeleet: jsonData})
        }
        res.render("upload")
    });

});


app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`)
})