import { Client, NotionClientError } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { PageStats } from "./notion.types";

dotenv.config()
const database_id = process.env.NOTION_DATABASE_ID ?? ''
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

export async function readNotion() {
    notion.databases.query({
        database_id,
        filter: { or: [{ type: 'title', title: { equals: '80486' }, property: '아이디' }] },
    })
        .then((pages: QueryDatabaseResponse) => pages.results.forEach((page) => console.log(JSON.stringify(page, null, 2)))
            , (error: NotionClientError) => {
                console.error(`READ FAILED : "${error.message}"`)
            })
}

export async function writeNotion(properties: PageStats) {
    const equals = properties.아이디.title[0].text.content
    const coverURL = properties.썸네일.files[0].external.url
    notion.databases.query({
        database_id,
        filter: { or: [{ type: 'title', title: { equals }, property: '아이디' }] }
    }).then((res: Partial<QueryDatabaseResponse>) => {
        const { results } = res
        if (results && !results.length) {
            notion.pages.create({
                parent: { database_id },
                properties: properties as Record<keyof PageStats, any>,
                cover: { external: { url: coverURL } }
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`CREATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`CREATE FAILED: "${error.message}"`)
                    })
        } else if (results) {
            notion.pages.update({
                page_id: results[0].id,
                properties: properties as Record<keyof PageStats, any>,
                cover: { external: { url: coverURL } }
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`UPDATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`UPDATE FAILED: "${error.message}"`)
                        if (error.code === 'notionhq_client_request_timeout') {
                            setTimeout(()=>{}, 1000)
                        }
                    })
        }
    }, async (error: NotionClientError) => {
        console.error(`NOTION FAILED: "${error.message}"`)
        if (error.code === 'rate_limited') {
            setTimeout(()=>{}, 1000)
        }
    })
}