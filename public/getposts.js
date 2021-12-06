const path = require("path");
const fs = require("fs");

const dir_path = path.join(__dirname, "../src/content/posts");

const getPosts = () => {
  let post_list = [];
  fs.readdir(dir_path, (err, files) => {
    if (err) console.log("failed to list contents of directory: " + err);
    files.forEach((file, i) => {
      let obj = {};
      let post;
      fs.readFile(`${dir_path}/${file}`, "utf8", (err, contents) => {
        if (err) console.log("failed to read file: " + err);
        const getMetaDataIndices = (acc, elem, i) => {
          if (/^---/.test(elem)) acc.push(i);
          return acc;
        }
        const parseMetadata = ({ lines, metadata_indices }) => {
          if (metadata_indices.length > 0){
            let metadata = lines.slice(metadata_indices[0] + 1, metadata_indices[1]);
            metadata.forEach(line => {
              obj[line.split(": ")[0]] = line.split(": ")[1];
            });
            return obj;
          }
          else console.error("error in parsing metadata");
        }
        const parseContent = ({ lines, metadata_indices }) => {
          if (metadata_indices.length > 0)
            lines = lines.slice(metadata_indices[1] + 1, lines.length);
          return lines.join("\n");
        }
        const lines = contents.split("\n");
        const metadata_indices = lines.reduce(getMetaDataIndices, []);
        const metadata = parseMetadata({lines, metadata_indices});
        const content = parseContent({lines, metadata_indices});
        post = {
          id: i + 1,
          title: metadata.title ? metadata.title : "No title",
          author: metadata.author ? metadata.author : "No author",
          date: metadata.date ? metadata.date : "No date",
          content: content ? content : "No content"
        }
        console.log(post);
        post_list.push(post);
        if (i === files.length - 1) {
          let data = JSON.stringify(post_list);
          fs.writeFileSync("./src/content/posts.json", data);
        }
      })
    })
  })
}

getPosts();
