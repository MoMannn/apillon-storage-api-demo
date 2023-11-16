const apiKey = "";
const apiSecret = "";
const bucketUuid = "";

$(async function () {
  await loadFiles(null);
});

async function uploadFiles() {
  try {
    const uploadedFiles = $("#uploadFiles")[0].files;
    const files = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      files.push({
        fileName: uploadedFiles[i].name,
        contentType: uploadedFiles[i].type,
        path: "demo",
      });
    }
    // Get upload urls for all files
    const uploadUrl = await $.ajax({
      url: `https://api.apillon.io/storage/${bucketUuid}/upload`,
      type: "POST",
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":" + apiSecret)}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      data: JSON.stringify({
        files,
      }),
    });
    console.log(uploadUrl.data);

    // upload files
    for (let i = 0; i < uploadUrl.data.files.length; i++) {
      const response = await $.ajax({
        url: uploadUrl.data.files[i].url,
        type: "PUT",
        headers: {
          "Content-Type": uploadedFiles[i].type,
        },
        data: uploadedFiles[i],
        processData: false,
      });
      console.log(response);
    }

    // end upload session
    await $.ajax({
      url: `https://api-dev.apillon.io/storage/${bucketUuid}/upload/${uploadUrl.data.sessionUuid}/end`,
      type: "POST",
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":" + apiSecret)}`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (e) {
    console.log(e);
  }
}

async function loadFiles(directory) {
  let filter = "";
  let append = "#files";
  if (!directory) {
    $("#files").html("");
  } else {
    filter = `?directoryUuid=${directory}`;
    append = `#files_${directory}`;
  }
  try {
    const files = await $.ajax({
      url: `https://api-dev.apillon.io/storage/${bucketUuid}/content${filter}`,
      type: "GET",
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":" + apiSecret)}`,
      },
    });
    for (let i = 0; i < files.data.items.length; i++) {
      if (files.data.items[i].type == 1) {
        $(append).append(`
        <div class="col-sm-12">
          <p><a href="#" onclick="loadFiles('${files.data.items[i].uuid}')">${files.data.items[i].name}</a></p>
        </div>
        <div id="files_${files.data.items[i].uuid}" class="col-sm-12 pl-3"></div>
        `);
      } else {
        $(append).append(`
        <div class="col-sm-12">
          <p><a target="_blank" href="${files.data.items[i].link}">${files.data.items[i].name}</a></p>
        </div>
      `);
      }
    }
    console.log(files.data);
  } catch (e) {
    console.log(e);
  }
}
