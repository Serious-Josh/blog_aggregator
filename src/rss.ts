import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function feedFetch(feedURL: string){
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator"
        }
    });

    const data = await response.text();
    const parser = new XMLParser({processEntities: false});

    const parsed_data = parser.parse(data)["rss"];

    let output = {};

    if("channel" in parsed_data){
        if("title" in parsed_data["channel"] && "link" in parsed_data["channel"] && "description" in parsed_data["channel"]){
            const title = parsed_data["channel"]["title"];
            const link = parsed_data["channel"]["link"];
            const description = parsed_data["channel"]["description"];

            let items = [];
            const fullItems = [];
            if("item" in parsed_data["channel"]){

                //making sure items are all in an array
                if(!Array.isArray(parsed_data["channel"]["item"])){
                    items.push(parsed_data["channel"]["item"]);
                }
                else{
                    items = parsed_data["channel"]["item"];
                }

                for(let item of items){
                    if(!item.title || !item.link || !item.description || !item.pubDate){
                        continue;
                    }

                    const newItem = {title: item.title, link: item.link, description: item.description, pubDate: item.pubDate};

                    fullItems.push(newItem);
                }
            }

            output = {channel: {title: title, link: link, description: description, item: fullItems}};
        }
        else{
            throw new Error("Invalid channel layout.");
        }
    }
    else{
        throw new Error("No channel detected in feed.");
    }

    return output;
}