console.log("updater start")
import { execFile } from 'node:child_process';
const child_git = execFile('git ', ['pull'], (error, stdout, stderr) => {
  if (error) {
    console.log("error lanzando git", error)
  }
  console.log(stdout);
  const child_start = execFile('node ', ['./index.js'], (error, stdout, stderr) => {
    if (error) {
      console.log("error lanzando node index", error)
    }
    console.log(stdout);

  });


});

setTimeout(() => {
  console.log("updater end")
}, 1000)