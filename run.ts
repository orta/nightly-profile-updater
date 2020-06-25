
const { join } = require("path");
import { graphql } from "@octokit/graphql";
import * as playwright from 'playwright'
import { existsSync } from "fs";
import { execSync } from "child_process";

(async () => {

  const response: any = await graphql(
    `
    query { 
      viewer { 
        login
        pullRequests(last: 5) {
          nodes {
            repository {
              name
              owner {
                avatarUrl
                login
              }
            }
            state
            title
            bodyHTML
          }
        }
      }
    }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_API_TOKEN}`,
      },
    }
  );
  console.log(`Got PRs for ${response.viewer.login}`)
  const prs = response.viewer.pullRequests.nodes
  
  const browser = await playwright["chromium"].launch();
    for (const pr of prs) {
      const i = prs.indexOf(pr)
      const context = await browser.newContext();
      const page = await context.newPage();
    
      const url = `file:${join(__dirname, 'web', 'index.html')}`;
      await page.goto(url);
    
      const JS = `
      document.getElementById("org-icon").src = '${pr.repository.owner.avatarUrl}'
      document.getElementById("repo-name").innerText = '${pr.repository.owner.login}/${pr.repository.name}'
      document.getElementById("pr-name").innerText = '${pr.title}'
      document.getElementById("pr-body").innerHTML = '${pr.bodyHTML}'
      `
      await page.evaluate(JS);
    
      await page.screenshot({ path: `./images/${i}.png`, clip: { x: 0, y: 0, width: 378, height: 100 } });
    }
    console.log("made screenshots")
  await browser.close();

  if (existsSync("dd2892cdc1b724f5434cf674fa83f3a8")) {
    execSync("rm -rf dd2892cdc1b724f5434cf674fa83f3a8")
  }
  execSync(`git clone https://orta:${process.env.GITHUB_API_TOKEN}@gist.github.com/dd2892cdc1b724f5434cf674fa83f3a8.git`)
  execSync("rm dd2892cdc1b724f5434cf674fa83f3a8/*")


  const Gm = require("gm");
  Gm()
  .in("images/*.png")
  .delay(500)
  .resize(378, 100)
  .write("dd2892cdc1b724f5434cf674fa83f3a8/main.gif", async function(err){
    if (err) throw err;
    console.log("animated.gif created");


    execSync("git add .", { cwd: "dd2892cdc1b724f5434cf674fa83f3a8"  })
    execSync("git commit -m 'update'", { cwd: "dd2892cdc1b724f5434cf674fa83f3a8"  })
    execSync("git push", { cwd: "dd2892cdc1b724f5434cf674fa83f3a8"  })
    console.log("done")

  })
})();

