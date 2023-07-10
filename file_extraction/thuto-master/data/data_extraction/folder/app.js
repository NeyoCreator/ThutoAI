// 0. HEADER
//0.1 GLOBAL VARIABLES
var bool_global = true
var time_global = null;
var time = 8000

//0.2 FUNCTION CALLS
init();
GetDataWorkItem();
check_linked_data();


timer(bool_global, time_global)

//0.3 INITIALIZE CLIENT
async function init() {
  var client = await app.initialized();
  client.instance.resize({ height: "600px" });
}
//0.4 INTERVAL KICK 
function timer(bool_global, time_global) {
  if (bool_global == true) {
    window.setTimeout(function () {
      comment_sync();
    }, time_global);
  } else {
    stop()
  }
}

//0.5 STOPPING
function stop() {
  clearTimeout(timer)
}

//1.1 SHOW WORK ITEM MODAL
async function show_work_item() {
  //GET CLIENT DATA
  var client
  client = await app.initialized();
  client.interface.trigger("showModal", {
    title: "Create Work Item",
    template: "workitem.html"
  }).then(function (data) {
    // GetDataBug();
    console.log(JSON.stringify(data))

  }).catch(function () {
    show_message("danger", "Error :", "with internal code, contact the technical support team.1")
  });

}
// function sanitizeInput(input) {
//   // Remove HTML tags using a regular expression
//   var sanitizedInput = input.replace(/<[^>]*>/g, '');

//   // Escape special characters
//   // var divElement = document.createElement('div');
//   // divElement.textContent = sanitizedInput;
//   // sanitizedInput = divElement.innerHTML;

//   return sanitizedInput;
// }
//1.2 SHOW BUG ITEM MODAL
async function show_bug() {
  var client
  client = await app.initialized();

  client.interface.trigger("showModal", {
    title: "Create Bug Item",
    template: "bug.html"
  }).then(function (data) {
    console.log(JSON.stringify(data))
    //GetDataBug();

  }).catch(function () {
    show_message("danger", "Error: ", "with internal code, contact the technical support team.x")
  });

}

//1.2 SHOW USER STORY
async function show_user_story() {
  var client
  client = await app.initialized();

  client.interface.trigger("showModal", {
    title: "Create User story",
    template: "user_story.html"
  }).then(function (data) {
    console.log(JSON.stringify(data))
    //GetDataBug();

  }).catch(function () {
    show_message("danger", "Error: ", "with internal code, contact the technical support team.x")
  });

}

//1.3 SHOW LINK
async function show_link() {
  //GET CLIENT DATA
  var client
  client = await app.initialized();
  client.interface.trigger("showModal", {
    title: "Link Devops Item",
    template: "link.html"
  }).then(function (data) {
    console.log(JSON.stringify(data))

  }).catch(function () {
    show_message("danger", "Error: ", "with internal code, contact the technical support team.2")
  });


}

//2. GET WORK ITEMS DATA
async function GetDataWorkItem() {
  // 2.1 MAKE API CALL
  var client
  client = await app.initialized();
  var bool_GetDataWorkItem = false
  var time_GetDataWorkItem = 15000
  timer(bool_GetDataWorkItem, time_GetDataWorkItem)
  //var subdomain = await client.iparams.get('Azure_Domain');
  // var url_GetDataWorkItem = subdomain["Azure_Domain"] + `/_apis/projects?api-version=5.1`;
  // var authOpts_GetDataWorkItem = {
  //   headers: {
  //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
  //     'Content-Type': 'application/json'
  //   }
  // };

  await client.request.invokeTemplate("getDataWorkItem", { "context": {} })
    .then(
      async function (response) {
        response = await response["response"]
        response = await JSON.parse(response)
        var ProjectNames = response.value;
        var ProjectNamesListBug = [];
        // 2.2 ITERRATE THROUGH RESULT
        for (var i = 0; i < ProjectNames.length; i++) {
          ProjectNamesListBug.push(ProjectNames[i].name);
        }

        //  2.3 POPULATE DROPDOWN
        var Select = document.getElementById("projectName");
        for (var i = 0; i < ProjectNamesListBug.length; i++) {
          var opt = ProjectNamesListBug[i];
          var el = document.createElement("option");
          el.textContent = opt;
          el.value = opt;
          Select.appendChild(el);
        }
        // 2.4 DEFINE DESCRIPTION EDITOR
        tinymce.init({
          selector: 'textarea#description'
        })

        // 2.5 GET TTITLE AND DESCRIPTION
        client.data.get("ticket").then(
          function (data) {
            let title = JSON.stringify(data['ticket']['subject']);
            let description = JSON.stringify(data['ticket']['description']);
            let tags = JSON.stringify(data["ticket"]["tags"][0]);
            if (tags == null) {
              tags = "NULL";
            } else {
              tags = tags.replace(/['"]+/g, '');
            }

            // 2.6 REMOVE QUOTATION MARKS
            title = title.replace(/['"]+/g, '');

            //3.4.2 REMOVE HTML TAGS
            description = description.replace(/\\n/g, '');

            // 2.7 REMOVE FIRST CHARACTER
            description = description.substring(1);
            description = description.substring(0, description.length - 1);
            document.getElementById("title").value = title;
            document.getElementById("tags").value = tags;
            document.getElementById("description").value = description;
          },
          function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.9")
          }
        );

      },
      function () {
        // show_message("danger", "Error: ", "with URL request, recheck API credential.10")
      }
    );
}

//4. CREATE WORK ITEMS
async function CreateItemNotes() {
  var client;
  client = await app.initialized();

  // GET TICKET ID
  var ticket_id_CreateItemNotes = await client.data.get("ticket");
  ticket_id_CreateItemNotes = ticket_id_CreateItemNotes["ticket"]["id"];

  // URL VALUES
  var Azure_Domain = await client.iparams.get('Azure_Domain');
  var global_createItemNotes = {};

  // GET VALUES FROM HTML PAGE
  var project_name = document.getElementById("projectName").value;
  var title = document.getElementById("title").value;
  var description = document.getElementById("description").value;
  var tags = document.getElementById("tags").value;
  var priority = document.getElementById("priority").value;

  // DEFINE REQUEST BODY
  var raw_CreateItemNotes = JSON.stringify([
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": title
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": description
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "from": null,
      "value": priority
    },
    {
      "op": "add",
      "path": "/fields/System.Tags",
      "value": tags
    },
  ]);

  await client.request.invokeTemplate("createItemNotes", { "context": { "id": ticket_id_CreateItemNotes } }).then(
    async function (response_note) {
      response_note = response_note["response"];
      response_note = JSON.parse(response_note);
      console.log(JSON.stringify(response_note));
    }, function () {
      show_message("danger", "Error: ", "with URL request, recheck API credential.14");
    });

  client.iparams.get('Azure_Domain')
    .then(async function (subdomain) {
      console.log(JSON.stringify(subdomain));

      return await client.request.invokeTemplate("postAzureItem", { "context": { "projectName": project_name }, body: raw_CreateItemNotes });
    })
    .then(async function (response) {
      response = response["response"];
      response = JSON.parse(response);
      var data = response;
      global_createItemNotes["task_id"] = data["id"];
      return data["id"];
    })
    .then(async function () {
      // ADD LINK TO WORK ITEM
      var FreshDomain = await client.iparams.get('Fresh_Domain');
      var raw_CreateItemNotes1 = JSON.stringify({
        "text": `<a href="${FreshDomain["Fresh_Domain"] + "/a/tickets/" + ticket_id_CreateItemNotes}" target="_blank">${"Freshdesk Ticket :" + global_createItemNotes["task_id"]}</a>`
      });

      return await client.request.invokeTemplate("postFreshUrl", { "context": { "projectName": project_name, "taskId": global_createItemNotes["task_id"] }, body: raw_CreateItemNotes1 });
    })
    .then(async function (response) {
      console.log(JSON.stringify(response));
      let item_link = Azure_Domain["Azure_Domain"] + "/" + project_name + "/_workitems/edit/" + global_createItemNotes["task_id"];
      let content = `<a href="${item_link}" target="_blank">Azure Work Item ${global_createItemNotes["task_id"]} URL</a>`;
      var wrapper = document.createElement('div');
      wrapper.textContent = content;

      var note_CreateItemNotes1 = "Work Item " + global_createItemNotes["task_id"] + " Created Successfully " + "@" + project_name + " \n" + wrapper.innerHTML;
      var raw_CreateItemNotes2 = JSON.stringify({
        "body": note_CreateItemNotes1,
        "private": true
      });

      client.db.set("ticket:" + ticket_id_CreateItemNotes, { "notes_data": [] }).then(
        function (data) {
          console.log(JSON.stringify(data));
        },
        function () {
          show_message("danger", "Error: ", "with database, refresh the page.15");
        });

      return await client.request.invokeTemplate("postAzureUrl", { "context": { "ticketId": ticket_id_CreateItemNotes }, body: raw_CreateItemNotes2 });
    })
    .then(async function (response_freshdesk) {
      console.log(JSON.stringify(response_freshdesk));
      client.db.update("ticket:" + ticket_id_CreateItemNotes, "set", { "show_alert": {} });
      Toastify({
        text: "Work Item created successfully",
        className: "success",
        duration: 4000,
        position: "center",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
      }).showToast();
    })
    .catch(function (error) {
      show_message("danger", "Error: ", JSON.stringify(error));
    });
}

//5. CREATE BUGS
async function CreateBug() {
  var client = await app.initialized();
  var project_name = sanitizeInput(document.getElementById("projectName").value);
  var tittle = sanitizeInput(document.getElementById("title").value);
  var description = sanitizeInput(document.getElementById("description").value);
  var tags = sanitizeInput(document.getElementById("tags").value);
  var priority = sanitizeInput(document.getElementById("priority").value);
  var severity = sanitizeInput(document.getElementById("severity").value);
  var acceptance_criteria = sanitizeInput(document.getElementById("acceptance_criteria").value);
  var retro_steps = sanitizeInput(document.getElementById("retro_steps").value);
  
  var ticket_id_CreateBug = (await client.data.get("ticket")).ticket.id;
  var Azure_Domain = (await client.iparams.get('Azure_Domain')).Azure_Domain;
  
  var raw_CreateBug = JSON.stringify([
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": tittle
    }, {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "from": null,
      "value": priority
    }, {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Severity",
      "from": null,
      "value": severity
    }, {
      "op": "add",
      "path": "/fields/System.Tags",
      "value": tags
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.TCM.ReproSteps",
      "value": retro_steps
    }, {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
      "value": acceptance_criteria
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": description
    },
  ]);

  await client.request.invokeTemplate("CreateBug", { "context": { "id": ticket_id_CreateBug } }).then(
    async function (response_note) {
      response_note = JSON.parse(response_note.response);
      console.log(JSON.stringify(response_note));
    }, function () {
      show_message("danger", "Error: ", "with URL request, recheck API credential.16");
    }
  );

  await client.iparams.get('Azure_Domain').then(
    async function (subdomain) {
      console.log(JSON.stringify(subdomain));

      return await client.request.invokeTemplate("postAzureBug", { "context": { "projectName": project_name }, body: raw_CreateBug, });
    }
  ).then(async function (response) {
    response = JSON.parse(response.response);
    var data = response;
    global_createBug["task_id"] = data.id;
    return data.id;
  }).then(async function () {
    var FreshDomain = await client.iparams.get('Fresh_Domain');
    var linkElement = createLinkElement(FreshDomain.Fresh_Domain, ticket_id_CreateBug, global_createBug["task_id"]);
    var raw_CreateBug1 = JSON.stringify({
      "text": linkElement.outerHTML
    });
    return await client.request.invokeTemplate("postFreshUrlBug", { "context": { "projectName": project_name, "taskId": global_createBug["task_id"] }, body: raw_CreateBug1, });
  }).then(async function (response) {
    console.log(JSON.stringify(response));
    var item_link = Azure_Domain + "/" + project_name + "/_workitems/edit/" + global_createBug["task_id"];
    var linkElement = createLinkElement(item_link, "Azure Bug Item " + global_createBug["task_id"] + " URL");
    var content = document.createElement('div');
    content.appendChild(linkElement);
    var note_CreateBug = "Bug Item " + global_createBug["task_id"] + " Created Successfully " + "@" + project_name + " \n";
    note_CreateBug += content.innerHTML;
    var raw_CreateBug2 = JSON.stringify({
      "body": note_CreateBug,
      "private": true
    });

    return client.request.invokeTemplate("postAzureUrlBug", { "context": { "ticketId": ticket_id_CreateBug }, body: raw_CreateBug2 });
  }).then(async function (response_freshdesk) {
    console.log(JSON.stringify(response_freshdesk));
    Toastify({
      text: "Bug Item created Successfully",
      className: "Success",
      duration: 4000,
      position: "center",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
    }).showToast();
    window.setTimeout(function () {
      //timer(true, 1000)   
    }, 4000);

    return await client.request.invokeTemplate("azureLinkTwo", { "context": { "project_url": project_url, "work_link": global_link_ticket["work_link"] } });
  }).catch(function (error) {
    if (error) {
      show_message("danger", "Error: ", "with URL request, recheck API credential.18");
    }
  });
}

function createLinkElement(href, text) {
  var link = document.createElement('a');
  link.href = href;
  link.target = "_blank";
  link.textContent = text;
  return link;
}


function createLinkElement(href, text) {
  var link = document.createElement('a');
  link.href = href;
  link.target = "_blank";
  link.textContent = text;
  return link.outerHTML;
}





async function CreateUserStory() {
  var client;
  client = await app.initialized();
  //5.1 GET VALUES HTML PAGE
  var project_name = document.getElementById("projectName").value;
  var tittle = document.getElementById("title").value;
  var description = document.getElementById("description").value;
  var acceptance_criteria = document.getElementById("acceptance_criteria").value;

  //GET TICKET ID
  var ticket_id_CreateBug = await client.data.get("ticket");
  ticket_id_CreateBug = ticket_id_CreateBug["ticket"]["id"];
  
  var Azure_Domain = await client.iparams.get('Azure_Domain');
  var global_createBug = {};

  // 5.2 DEFINE REQUEST BODY
  var raw_CreateBug = JSON.stringify([
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": tittle
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": description
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
      "value": acceptance_criteria
    }
  ]);

  await client.request.invokeTemplate("CreateUserStory", { "context": { "id": ticket_id_CreateBug } })
    .then(async function (response_note) {
      response_note = response_note["response"];
      response_note = JSON.parse(response_note);
      console.log(JSON.stringify(response_note));
    }, function () {
      show_message("danger", "Error: ", "with URL request, recheck API credential.16");
    });

  await client.iparams.get('Azure_Domain')
    .then(async function (subdomain) {
      console.log(subdomain);
      return await client.request.invokeTemplate("postAzureUserStory", { "context": { "projectName": project_name }, body: raw_CreateBug });
    })
    .then(async function (response) {
      response = response["response"];
      response = JSON.parse(response);
      var data = response;
      global_createBug["task_id"] = data["id"];
      return data["id"];
    })
    .then(async function () {
      var FreshDomain = await client.iparams.get('Fresh_Domain');
      var item_link = Azure_Domain["Azure_Domain"] + "/" + project_name + "/_workitems/edit/" + global_createBug["task_id"];
      var note_CreateBug = "User story " + global_createBug["task_id"] + " Created Successfully " + "@" + project_name + " \n" + "Azure User Story URL: " + item_link;
      var raw_CreateBug2 = JSON.stringify({
        "body": note_CreateBug,
        "private": true
      });

      return await client.request.invokeTemplate("postFreshUrlUserStory", { "context": { "projectName": project_name, "taskId": global_createBug["task_id"] }, body: raw_CreateBug2 });
    })
    .then(async function (response) {
      console.log(JSON.stringify(response));
      Toastify({
        text: "User story created Successfully",
        className: "Success",
        duration: 4000,
        position: "center",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)"
        }
      }).showToast();
      window.setTimeout(function () {
        console.log("Showing Message");
      }, 4000);

      var url_CreateBug3 = Azure_Domain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workitems?api-version=6.0&ids=" + global_createBug["task_id"];
      return client.request.get(url_CreateBug3);
    })
    .catch(function (error) {
      if (error) {
        show_message("danger", "Error: ", "with URL request, recheck API credential.18");
      }
    });
}



//7.COMMENT SYNC
async function comment_sync() {
  var global_comment_sync = {}
  var client
  client = await app.initialized();
  var bool_comment_sync = true;
  var time_comment_sync = 8000
  timer(bool_comment_sync, time_comment_sync)

  client.data.get("ticket")
    .then(async function (data) {
      global_comment_sync["ticket_id"] = data["ticket"]["id"];


      // var subdomain = await client.iparams.get('Fresh_Domain');
      // var url_comment_sync = subdomain["Fresh_Domain"] + "/api/v2/tickets/" + global_comment_sync["ticket_id"] + "/conversations"
      // var requestOptions = {
      //   headers: { Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`, 'Content-Type': 'application/json', },
      //   redirect: "follow"
      // }
      // # REQUEST 1
      return client.request.invokeTemplate("createItemNotes", { "context": { "id": global_comment_sync["ticket_id"] } })
    })
    .then(async function (response_note) {
      response_note = response_note["response"]
      response_note = JSON.parse(response_note)
      var boolean_status_check = JSON.stringify(response_note)
      var status_value;
      var status_value_bool;
      var information_array = []
      var notes_key_array = []

      status_value_bool = boolean_status_check.includes("DevOps Work Item Status:  ")
      let notes_objects = {}
      let notes_key = null
      getInformation(notes_key, notes_objects, status_value, response_note, information_array, notes_key_array, information_array)

      var project_name = information_array[2]
      var key_task = information_array[1]
      var notes_key_array = information_array[3]
      var notes_object = information_array[0]



      let notes_values = getRequiredNotes(notes_object, notes_key_array)

      if (project_name == undefined) {

      } else {
        // var subdomain = await client.iparams.get('Azure_Domain');
        // var url_comment_sync1 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workItems/" + key_task + "/comments?api-version=6.0-preview.3";
        // var authOpts_comment_sync1 = {
        //   headers: {
        //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
        //     'Content-Type': 'application/json-patch+json',
        //   }
        // }
        //  # REQUEST 2
        await client.request.invokeTemplate("WorkItems", { "context": { "proj_name": project_name, "key_task": key_task } })
          .then(async function (response) {
            response = response["response"]

            response = JSON.parse(response)

            response = response["comments"]

            //6.5 OBATIN COMMENTS DATA
            let comments_object = {}
            var cleaned_comment_object = getComments(response, comments_object)
            //CLEAN COMMENT VALUE
            for (const [key, value] of Object.entries(cleaned_comment_object)) {

              var test_data = value.substring(0, 9)

              if (test_data == "Freshdesk") {
                var length_value = value.length
                var cleaned_value = value.substring(15, length_value)
                cleaned_comment_object[key] = cleaned_value
              }
            }
            let comments_values = Object.values(cleaned_comment_object)

            //CLEAN COMMENT VALUES
            for (let i = 0; i < comments_values.length; i++) {
              comments_values[i] = comments_values[i].trim()
            }

            ticketStatusChange(client, key_task, global_comment_sync, status_value_bool)
            client.data.get("ticket").then(
              function (data) {
                console.log(JSON.stringify(data))
                return client.db.get("ticket:" + global_comment_sync["ticket_id"])
              })
              .then(async function (data) {
                //TICKET EXIST
                let database_notes = data["notes_data"]
                if (notes_values.length == comments_values.length) {
                  for (var i = 0; i < notes_values.length; i++) {
                    //IF ONE VALUE IS EDITED
                    if (notes_values[i].trim() != comments_values[i].trim()) {
                      bool(client, comments_values, notes_values, comments_object, notes_object, i, database_notes, global_comment_sync, project_name, key_task)
                    }
                  }
                }
                else if (notes_values.length > comments_values.length) {
                  notesGreater(client, notes_values, comments_values, database_notes, global_comment_sync, key_task, project_name, notes_object)
                }
                else if (comments_values.length > notes_values.length) {
                  commentGreater(client, notes_values, comments_values, database_notes, project_name, key_task, global_comment_sync, comments_object)
                }
              },
                function () {
                  //ADD TICKET DATA TO DATABASE
                  return client.db.set("ticket:" + global_comment_sync["ticket_id"], { "notes_data": notes_values })

                })
              .then(function () {
                console.log("Updated Database")

              },
                function () {
                  show_message("danger", "Error: ", "with database, refresh the page.22")
                });
          },
            function () {
              show_message("danger", "Error: ", "with URL request, recheck API credential.23")
            }
          );
      }
    }).catch(function (error) {
      show_message("danger", "error", JSON.stringify(error))
    });

}
async function ticketStatusChange(client, work_item_id, global_comment_sync, bool_val) {

  // var subdomain = await client.iparams.get('Azure_Domain');
  // var url_comment_note = subdomain["Azure_Domain"] + "/_apis/wit/workitems/" + work_item_id + "?api-version=6.0";
  // var authOpts_comment_note = {
  //   headers: {
  //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
  //     'Content-Type': 'application/json-patch+json',
  //   }
  // }
  await client.request.invokeTemplate("commentNote", { "context": { "workItemId": work_item_id } })
    .then(async function (response_data) {
      var response_data = response_data["response"]
      response_data = JSON.parse(response_data)
      response_data = response_data["fields"]
      var status_type = response_data["System.State"]
      var stat = "DevOps Work Item Status:  " + status_type
      var last_value = await client.db.get("ticket:" + global_comment_sync["ticket_id"])
      last_value = last_value["status_value"]
      if (typeof (last_value) == "undefined") {
        last_value = "holder"
      } else {
      }
      if (bool_val) {

        if (last_value.includes(stat)) {
          return
        } else {
          ticketStatus(client, stat)
        }
      } else if (bool_val == false && last_value == "holder") {
        ticketStatus(client, stat)
      }
    }).catch(function (error) {
      show_message("danger", "error", JSON.stringify(error))
    });


}
//8.SHOW MESSAGE
async function show_message(type_response, title_type, plain_text) {
  var client
  client = await app.initialized();
  client.interface.trigger("showNotify", {
    type: type_response,
    title: title_type,
    message: plain_text,
    template: "index.html"
  }).then(function (data) {
    console.log(JSON.stringify(data))
  }).catch(function (error) {
    show_message("danger", "error", JSON.stringify(error) + "25")
  });

}

//9.LINK TICKET
async function link_ticket() {
  var client;
  let project = [];
  let details = [];
  client = await app.initialized();

  // GET TICKET ID
  var ticket_id_link_ticket = await client.data.get("ticket");
  ticket_id_link_ticket = ticket_id_link_ticket["ticket"]["id"];

  // URL VALUES
  var FreshDomain = await client.iparams.get('Fresh_Domain');
  var Azure_Domain = await client.iparams.get('Azure_Domain');
  var reg = /[$&+,:;=?@#|'<>.^*()%!-]/g;
  var regEx = /[a-zA-Z]/g;
  var condition = false;
  
  // GLOBAL DICTIONARY
  var global_link_ticket = {};
  global_link_ticket["work_link"] = document.getElementById("workid").value;
  
  if (global_link_ticket["work_link"].length == 0) {
    condition = true;
  } else if (regEx.test(global_link_ticket["work_link"]) == true) {
    condition = true;
    document.getElementById("workid");
  } else if (reg.test(global_link_ticket["work_link"]) == true) {
    condition = true;
  } else {
    condition = false;
  }

  if (condition == false) {
    await client.request.invokeTemplate("commentNote", { "context": {} })
      .then(async function (response_project) {
        response_project = response_project["response"];
        response_project = JSON.parse(response_project);
        response_project = response_project["value"];
        
        for (var i = 0; i < response_project.length; i++) {
          let project_name = response_project[i]['name'];
          project.push(project_name);
        }

        var project_url = project[0];
        
        await client.request.invokeTemplate("azureLink", { "context": { "project_url": project_url, "work_link": global_link_ticket["work_link"] } })
          .then(async function (data) {
            console.log(JSON.stringify(data));
          })
          .catch(function () {
            Toastify({
              text: "Ticket does not exist",
              className: "error",
              duration: 4000,
              position: "center",
              style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              }
            }).showToast();

            window.setTimeout(function () {
              client.instance.close();
            }, 4000);
          });

        return await client.request.invokeTemplate("azureLinkTwo", { "context": { "project_url": project_url, "work_link": global_link_ticket["work_link"] } });
      })
      .then(async function (res) {
        res = res["response"];
        res = JSON.parse(res);
        res = res["value"][0]["fields"];
        
        var type = res["System.WorkItemType"];
        var proj_name = res["System.TeamProject"];
        var state = res["System.State"];
        
        if ("System.AssignedTo" in res) {
          var assigned = res["System.AssignedTo"]['displayName'];
        } else {
          var assigned = null;
        }
        
        var description = res["System.Description"].replace(/<\/?[^>]+(>|$)/g, "");
        details.push(type, proj_name, state, assigned, description, global_link_ticket["work_link"]);
        return client.data.get("ticket");
      })
      .then(async function (data) {
        console.log(JSON.stringify(data));
        var task_id = global_link_ticket["work_link"];
        global_link_ticket["task_id"] = task_id;
        var ticket_id = data["ticket"]["id"];

        await client.request.invokeTemplate("link_task", { "context": { "ticket_id": ticket_id, "task_id": task_id } })
          .then(async function (res) {
            Toastify({
              text: "Successfully Linked",
              className: "success",
              duration: 4000,
              position: "center",
              style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              }
            }).showToast();
            window.setTimeout(function () {
              client.instance.close();
            }, 4000);
          })
          .catch(function (err) {
            console.error(err);
            Toastify({
              text: "Error occurred",
              className: "error",
              duration: 4000,
              position: "center",
              style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              }
            }).showToast();
            window.setTimeout(function () {
              client.instance.close();
            }, 4000);
          });
      })
      .catch(function (err) {
        console.error(err);
        Toastify({
          text: "Error occurred",
          className: "error",
          duration: 4000,
          position: "center",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();
        window.setTimeout(function () {
          client.instance.close();
        }, 4000);
      });
  } else {
    Toastify({
      text: "Invalid input",
      className: "error",
      duration: 4000,
      position: "center",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
    }).showToast();
    window.setTimeout(function () {
      client.instance.close();
    }, 4000);
  }
}



//10.CHECK LINKED DATA
async function check_linked_data() {
  var client;
  client = await app.initialized();

  client.data.get("ticket").then(
    function (data) {
      var ticket_id_check_linked_data = data["ticket"]["id"];

      client.db.get("ticket:" + ticket_id_check_linked_data).then(
        function (data) {

          var is_linked_1 = "linked_data" in data
          console.log(is_linked_1)
          var linked_data_array = data["linked_data"]
          console.log(linked_data_array)
        },
        function () {
          show_message("danger", "Error: ", "with internal code, contact the technical support team.28")

        });

    },
    function () {
      show_message("danger", "Error: ", "with internal code, contact the technical support team.28")
    });

}

//11.GET KEY VAUES
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}



//15.SECDOND DUPLICATE FUNCTION
function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

async function bool(client, comments_values, notes_values, comments_object, notes_object, i, database_notes, global_comment_sync, project_name, key_task) {
  var value1 = notes_values[i]
  var value2 = comments_values[i]
  let bool_note = database_notes.indexOf(value1)
  let bool_comment = database_notes.indexOf(value2)
  project_name =project_name.trim()
  if (bool_note == -1) {
    //ADD NOTE TO DEVOPS

    var comment_id = getKeyByValue(comments_object, value2)
   // var subdomain = await client.iparams.get('Azure_Domain');
   // var url_comment_sync2 = subdomain["Azure_Domain"] + "/" + project_name.trim() + "/_apis/wit/workItems/" + key_task + "/comments/" + comment_id + "?api-version=6.0-preview.3";
    var raw = JSON.stringify({
      "text": `<div><strong>Freshdesk Note:</strong></div><br></br><div>${value1.trim()}</div>`
    });
    // var authOpts_comment_sync2 = {
    //   headers: {
    //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: raw,
    // };

    client.request.invokeTemplate("editComment", {"context":{"projectName":project_name,"key_task":key_task,"comment_id":comment_id},body:raw, })
      .then(
        function () {
          client.interface.trigger("showNotify", {
            type: "success", title: "",
            message: "Comment has been updated  on Devops"
          }).catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.36")
          })
          client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": notes_values })
        }),
      function () {
        show_message("danger", "Error: ", "with URL request, recheck API credential.37")
      }

  }

  else if (bool_comment == -1) {
    let v = notes_values[i]
    client.iparams.get('Fresh_Domain')
      .then(async function (subdomain) {
        console.log(subdomain)
        //ADD COMMENT TO FRESHDESK
        // THIS IS THE EDITE
        var added_value1 = "Devops Comment:\n" + value2;


        var comment_id = getKeyByValue(notes_object, v)
       // var url_comment_sync3 = subdomain["Fresh_Domain"] + "/api/v2/conversations/" + comment_id;
        var raw = JSON.stringify({
          body: added_value1,
        });
        // var authOpts_comment_sync3 = {
        //   headers: {
        //     Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: raw,
        // };
        return await client.request.invokeTemplate("editNote",{"context":{"comment_id": comment_id},body:raw, })

      })
      .then(
        async function (response) {
          console.log(JSON.stringify(response))
          client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": comments_values })
          client.interface.trigger("showNotify", {
            type: "success", title: "",
            message: "Devops Comment updated,refresh to sync."
          }).catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.38")
          })
        },
        function () {
          show_message("danger", "Error: ", "with URL request, recheck API credential.39")
        });

  }
  else {
  }

}

async function notesGreater(client, notes_values, comments_values, database_notes, global_comment_sync, key_task, project_name, notes_object) {
  var set = new Set(notes_values);
  var duplicateValues = []

  notes_values.filter(item => {
    if (set.has(item)) {
      set.delete(item);
    }
    else {
      duplicateValues.push(item);
      notes_values[notes_values.indexOf(item)] = item + " "
    }
  });

  let isduplicate = hasDuplicates(notes_values)

  if (isduplicate) {

  } else {

    let difference = notes_values.filter(x => !comments_values.includes(x));
    let check_value = Boolean(difference.every(x => database_notes.includes(x)))


    //UPDATE VALUES
    if (check_value) {
      for (let x = 0; x < difference.length; x++) {
        //ADD DELETE VALUE ON DEVOPS
        var deleted_value = difference[x].trim();
        var comment_id = getKeyByValue(notes_object, deleted_value)
        //var subdomain = await client.iparams.get('Fresh_Domain');
        // var url_comment_sync4 = subdomain["Fresh_Domain"] + "/api/v2/conversations/" + comment_id;
        // var requestOptions = {
        //   headers: { Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`, 'Content-Type': 'application/json', },
        //   redirect: "follow"
        // }
        //DELETE VALUE
        await client.request.invokeTemplate("deleteNote", { "context": { comment_id } })
          .then(
            function () {
              client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": notes_values })
              client.interface.trigger("showNotify", {
                type: "success", title: "",
                message: "Note been deleted,refresh to sync."
              }).catch(function () {
                show_message("danger", "Error: ", "with internal code, contact the technical support team.40")
              })

            })
          //UPDATE DATABASE
          .then(
            function (data) {
              console.log(JSON.stringify(data))
            },
            function () {
              show_message("danger", "Error: ", "with database, refresh the page.41")

            });
      }

    } else {

      for (let x = 0; x < difference.length; x++) {
        //ADD VALUE TO DEVOPS
        var added_value = difference[x]
        //var subdomain = await client.iparams.get('Azure_Domain');
        //var url_comment_sync5 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workitems/" + key_task + "/comments?api-version=6.0-preview.3";
        var raw = JSON.stringify({
          "text": `<div><strong>Freshdesk Note:</strong></div><br></br><div>${added_value}</div>`
        });
        // var authOpts_comment_sync4 = {
        //   headers: {
        //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: raw,
        // };

        await client.request.invokeTemplate("postComment", { "context": { "projectName": project_name, "taskId": key_task }, body: raw, })
          .then(
            async function (data) {
              console.log(JSON.stringify(data))

              return client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": notes_values })

            })
          .then(
            //UPDATE DATABASE
            function (data) {
              console.log(JSON.stringify(data))
            },
            function () {
              show_message("danger", "Error: ", "with database, refresh the page.42")
            });

        client.interface.trigger("showNotify", {
          type: "success",
          message: "Note added to Devops."

        })
          .then(function (data) {
            console.log(JSON.stringify(data))
          })
          .catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.43")

          });


      }
    }

  }
}

async function commentGreater(client, notes_values, comments_values, database_notes, project_name, key_task, global_comment_sync, comments_object) {
  var set = new Set(comments_values);
  var duplicateValues = []
  var commentGreate_obj = {}
  comments_values.filter(item => {
    if (set.has(item)) {
      set.delete(item);
    }
    else {
      duplicateValues.push(item);
      //REPLACE DUPLICATE 
      comments_values[comments_values.indexOf(item)] = item + " "
    }
  });


  let isduplicate = hasDuplicates(comments_values)
  if (isduplicate) {
   // var subdomain = await client.iparams.get('Azure_Domain');
    // var url_comment_sync6 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workitems/" + key_task + "/comments?api-version=6.0-preview.3";
    // var authOpts_comment_sync5 = {
    //   headers: {
    //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
    //     'Content-Type': 'application/json-patch+json',
    //   }

    // }
    await client.request.invokeTemplate("getComment", { "context": { "projectName": project_name, "taskId": key_task } }).then(
      async function (data) {
        let response = data["response"]
        response = JSON.parse(response)
        let comments = response["comments"]
        //GET LATEST COMMENT
        var latest_comment = comments[0]
        // GET UNIQUE NAME
        commentGreate_obj["input_email"] = latest_comment["createdBy"]["uniqueName"]

        //GET ALL AGENTS
        // var FreshDomain = await client.iparams.get('Fresh_Domain')
        // var url_comment_sync7 = FreshDomain["Fresh_Domain"] + "/api/v2/agents"
        // var requestOptions = {
        //   headers: { Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`, 'Content-Type': 'application/json', },
        //   redirect: "follow",
        // }
        return await client.request.invokeTemplate("getAgents", { "context": {} })
      })
      .then(async function (data) {
        var email_data = {}
        let response = data["response"]
        response = JSON.parse(response)
        for (var i = 0; i < response.length; i++) {
          email_data[response[i]["contact"]["email"]] = response[i]["id"]
        }

        //CHECK IF VALUE EXIST IN EMAIL_DATA
        // const hasValue = Object.keys(email_data).includes(commentGreate_obj["input_email"]);
        // const user_email_id = email_data[commentGreate_obj["input_email"]]
        //CONDITION
      },
        function () {
          show_message("danger", "Error: ", "with URL request, recheck API credential.46")
        }

      );

  } else {
    let difference = comments_values.filter(x => !notes_values.includes(x));
    let check_value = Boolean(difference.every(x => database_notes.includes(x)))
    //UPDATE VALUES


    if (check_value) {

      if (comments_values.length > 2) {

        CheckValueGreaterThanTwo(client, comments_values, project_name, key_task, global_comment_sync, comments_object, difference)

      }
      else {

        CheckValueGreaterLessThanTwo(client, comments_values, project_name, key_task, global_comment_sync, comments_object)
      }
    }
    else {
      //GET COMMENTS FROM DEVOPS
      //var subdomain = await client.iparams.get('Azure_Domain');
      // var url_comment_sync12 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workitems/" + key_task + "/comments?api-version=6.0-preview.3";
      // var authOpts_comment_sync10 = {
      //   headers: {
      //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
      //     'Content-Type': 'application/json-patch+json',
      //   }
      // }
      await client.request.invokeTemplate("getComment", { "context": { "projectName": project_name, "taskId": key_task } }).then(
        async function (data) {

          let response = data["response"]
          response = JSON.parse(response)
          let comments = response["comments"]

          //GET LATEST COMMENT
          var latest_comment = comments[0]
          // GET UNIQUE NAME

          commentGreate_obj["input_email2"] = latest_comment["createdBy"]["uniqueName"]
          //GET ALL AGENTS
          //var FreshDomain = await client.iparams.get('Fresh_Domain')
          //var url_comment_sync13 = FreshDomain["Fresh_Domain"] + "/api/v2/agents"
          // var requestOptions = {
          //   headers: { Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`, 'Content-Type': 'application/json', },
          //   redirect: "follow",
          // }
          await client.request.invokeTemplate("getAgents", { "context": {} }).then(
            async function (data) {
              var email_data = {}
              let response = data["response"]
              response = JSON.parse(response)
              
              for (var i = 0; i < response.length; i++) {
                email_data[response[i]["contact"]["email"]] = response[i]["id"]
              }

              //CHECK IF VALUE EXIST IN EMAIL_DATA
              const hasValue = Object.keys(email_data).includes(commentGreate_obj["input_email2"]);
              const user_email_id = email_data[commentGreate_obj["input_email2"]]
              //CONDITION
              if (hasValue) {
                let dif = difference.filter(x => !database_notes.includes(x));
                UserExists2(client, user_email_id, global_comment_sync, dif, comments_values)

              } else {
                let dif = difference.filter(x => !database_notes.includes(x));
                for (let x = 0; x < dif.length; x++) {
                  //ADD VALUES TO DEVOPS
                  var added_value = "Devops Comment:\n" + dif[x];
                  var is_public = dif[x].includes("#public")
                  var is_public_2 = duplicateValues[x].includes("#Public")

                  if (is_public == true || is_public_2 == true) {
                    //var subdomain = await client.iparams.get('Fresh_Domain');
                    //var url_comment_sync15 = subdomain["Fresh_Domain"] + "/helpdesk/tickets/" + global_comment_sync["ticket_id"] + "/conversations/note.json"
                    var raw = JSON.stringify({
                      "body": added_value,
                      "private": false

                    }
                    );
                  } else {
                    //var subdomain = await client.iparams.get('Fresh_Domain');
                    //var url_comment_sync15 = subdomain["Fresh_Domain"] + "/helpdesk/tickets/" + global_comment_sync["ticket_id"] + "/conversations/note.json"

                    var raw = JSON.stringify({
                      "body": added_value,
                      "private": true
                    })
                    
                  }
                  // var authOpts_comment_sync12 = {
                  //   headers: {
                  //     Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`,
                  //     'Content-Type': 'application/json',
                  //   },
                  //   body: raw,
                  // };

                  await client.request.invokeTemplate("postNote", { "context": { "ticketId": global_comment_sync["ticket_id"] }, body: raw, })
                    .then(function (data) {
                      console.log(JSON.stringify(data))
                      return client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": comments_values })
                    })
                    .then(function (data) {
                      console.log(data)
                    })
                    .catch(function () {
                      show_message("danger", "Error: ", "with URL request, recheck API credential.53")
                    });
                }
              }
            })
            .catch(function () {
              show_message("danger", "Error: ", "with URL request, recheck API credential.54")
            });
        })
        .catch(function () {
          console.log("Updated Database")
        });
    }

  }
}
function getComments(response, comments_object) {
  for (let x = 0; x < response.length; x++) {
    let body = response[x]['text'];
    let is_website = body.substring(0, 6);
    let idx_3 = response[x]['text'].indexOf("<a href");
    let test = body.substring(5, idx_3);
    test = test.replace(/&nbsp;/g, "");
    test = test.replace("<div>", "");
    let idx = response[x]['text'].includes(":");

    if (is_website == "<a hre") {
      // Handle website case
      // Add your logic here if needed
    } else if (idx == false) {
      let html = response[x]['text'];
      let div = document.createElement("div");
      div.innerHTML = html;
      let text = div.textContent || div.innerText || "";
      comments_object[response[x]['id']] = sanitizeHTML(text);
    } else {
      var val = response[x]['text'].indexOf(":");
      var val2 = response[x]['text'].substring(val + 1);
      val2 = val2.replace(/<\/?[^>]+(>|$)/g, "");
      var char_greater = val2.indexOf(">");
      val2 = val2.substring(char_greater + 1);
      var final_string = val2.replace(/&nbsp;/g, " ");
      final_string = test + final_string;
      final_string = final_string.replace("2.0,01199fc5-a221-4937-b823-77526be647c5&quot;&gt;", "");
      comments_object[response[x]['id']] = sanitizeHTML(final_string);
    }
  }
  
  return comments_object;
}

// Function to sanitize user-controlled HTML
function sanitizeHTML(html) {
  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}



async function ticketStatus(client, stat) {
  var global_comment_sync = {}
  //DevOps Work Item Status:  To Do
  if (!stat.includes("New") == true && !stat.includes("To Do") == true) {
    client.data.get("ticket")
      .then(async function (data) {
        global_comment_sync["ticket_id"] = data["ticket"]["id"]
        //var subdomain_fresh = await client.iparams.get('Fresh_Domain');
        //var url_Duplicates2 = subdomain_fresh["Fresh_Domain"] + "/helpdesk/tickets/" + global_comment_sync["ticket_id"] + "/conversations/note.json"
        var raw = JSON.stringify({
          "body": stat
        }
        );
        // var authOpts_Duplicates2 = {
        //   headers: {
        //     Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: raw,
        // };
        await client.request.invokeTemplate("postNote", { "context": { "ticketId": global_comment_sync["ticket_id"] }, body: raw })
          .then(
            function () {
              client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "status_value": stat })

              show_message("success", "Success:", "Work Item Status has Changed, Please refresh to sync")
            }).catch(function (error) {
              show_message("danger", "error", JSON.stringify(error))
            })
      }).catch(function (error) {
        show_message("danger", "error", JSON.stringify(error))
      })
  }
}

function getRequiredNotes(notes_object, notes_key_array) {
  let notes_value = []
  var key_value = notes_key_array[notes_key_array.length - 1]
  //iterate through the notes
  for (var key in notes_object) {
    //check if key is greate than notes_key
    if (key > key_value) {
      var value_array = notes_object[key]
      value_array = value_array.replace(/\u00A0/, " ");
      value_array = value_array.trim();
      notes_value.push(value_array);
    }

  }
  return notes_value
}



async function CheckValueGreaterThanTwo(client, comments_values, project_name, key_task, global_comment_sync, comments_object, difference) {
  for (let x = 0; x < difference.length; x++) {
    var deleted_value = difference[x];
    //var subdomain = await client.iparams.get('Azure_Domain');
  }
  var filtered_comments = {}
  for (const key in comments_object) {
    if (comments_object[key] == deleted_value) {
      filtered_comments[key] = comments_object[key]
    }
    else {
    }
  }


  //ITERATE THROUGH FILTERED ARRAY
  for (const key in filtered_comments) {
    //var url_comment_sync10 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workItems/" + key_task + "/comments/" + key + "?api-version=6.0-preview.3";
    // var authOpts_comment_sync8 = {
    //   headers: {
    //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
    //     'Content-Type': 'application/json-patch+json',
    //   }
    // }
    //CHANGE REQUEST STRUCTURE
    client.request.invokeTemplate("deleteComment", { "context": { "projectName": project_name, "key_task": key_task, "key": key } })
      .then(
        async function (data) {
          console.log(JSON.stringify(data))
          client.interface.trigger("showNotify", {
            type: "success", title: "",
            message: "Devops comment has been deleted."
          }).catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.47")
          })
          return client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": comments_values })
        })
      .then(
        function (data) {
          console.log(JSON.stringify(data))
        },
        function () {
          show_message("danger", "Error: ", "with database, refresh the page.48")
        });

  }
}
async function CheckValueGreaterLessThanTwo(client, comments_values, project_name, key_task, global_comment_sync, comments_object) {
  for (let x = 0; x < comments_values.length; x++) {
    var deleted_value = comments_values[x];
    // var subdomain = await client.iparams.get('Azure_Domain');
  }
  var filtered_comments = {}
  for (const key in comments_object) {
    if (comments_object[key] == deleted_value) {
      filtered_comments[key] = comments_object[key]
    }
    else {
    }
  }

  //ITERATE THROUGH FILTERED ARRAY
  for (const key in filtered_comments) {
    // var url_comment_sync10 = subdomain["Azure_Domain"] + "/" + project_name + "/_apis/wit/workItems/" + key_task + "/comments/" + key + "?api-version=6.0-preview.3";
    // var authOpts_comment_sync8 = {
    //   headers: {
    //     Authorization: `Basic <%= encode(iparam.Azure_Api) %>`,
    //     'Content-Type': 'application/json-patch+json',
    //   }
    // }

    //CHANGE REQUEST STRUCTURE
    client.request.invokeTemplate("deleteComment", { "context": { "projectName": project_name, "key_task": key_task, "key": key } })
      .then(
        async function (data) {
          console.log(JSON.stringify(data))
          client.interface.trigger("showNotify", {
            type: "success", title: "",
            message: "Devops comment has been deleted."
          }).catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.49")
          })
          return client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": comments_values })
        })
      .then(
        function (data) {
          console.warn(JSON.stringify(data))
        },
        function () {
          show_message("danger", "Error: ", "with database, refresh the page.50")
        });
  }
}

async function UserExists2(client, user_email_id, global_comment_sync, dif, comments_values) {
  for (let x = 0; x < dif.length; x++) {
    var added_value = "Devops Comment:\n" + dif[x];
    var is_public = dif[x].includes("#public")
    var is_public_2 = dif[x].includes("#Public")
    // alert(JSON.stringify({ is_public_2 }))
    if (is_public == true || is_public_2 == true) {
      //var subdomain = await client.iparams.get('Fresh_Domain');
      //var url_comment_sync14 = subdomain["Fresh_Domain"] + "/helpdesk/tickets/" + global_comment_sync["ticket_id"] + "/conversations/note.json"
      var raw = JSON.stringify({
        "body": added_value,
        "private": false,
        "user_id": user_email_id
      }
      );
      // var authOpts_comment_sync11 = {
      //   headers: {
      //     Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: raw,
      // };
    } else {
      //var subdomain = await client.iparams.get('Fresh_Domain');
      // var url_comment_sync14 = subdomain["Fresh_Domain"] + "/helpdesk/tickets/" + global_comment_sync["ticket_id"] + "/conversations/note.json"
      var raw = JSON.stringify({
          "body": added_value,
          "private": true,
          "user_id": user_email_id
      }
      );
      // var authOpts_comment_sync11 = {
      //   headers: {
      //     Authorization: `Basic <%= encode(iparam.Fresh_Api) %>`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: raw,
      // };
    }
    await client.request.invokeTemplate("postNote", { "context": { "ticketId": global_comment_sync["ticket_id"] }, body: raw })
      .then(
        function (data) {
          console.log(JSON.stringify(data))
          client.interface.trigger("showNotify", {
            type: "success", title: "",
            message: "Devops comment added,refresh to sync."
          }).catch(function () {
            show_message("danger", "Error: ", "with internal code, contact the technical support team.51")
          })
          return client.db.update("ticket:" + global_comment_sync["ticket_id"], "set", { "notes_data": comments_values })
        })
      .then(function (data) {
        console.log(JSON.stringify(data))
      },
        function () {
          show_message("danger", "Error: ", "with database, refresh the page.52")
        });
  }
}

function getInformation(notes_key, notes_objects, status_value, response_note, information_array, notes_key_array, information_array) {
  for (let x = 0; x < response_note.length; x++) {
    let from_email = response_note[x]['to_emails']
    let to_email = response_note[x]['from_email']
    let body_text = response_note[x]['body_text']
    var firstLine = body_text.split('\n')[0];
    let is_at = firstLine.includes("Created Successfully @")
    // alert(body_text)
    let idx = response_note[x]['body_text'].includes(":")
    status_value = response_note[x]['body_text'].includes("DevOps Work Item Status:  ")

    if (from_email == null || to_email == null) {
      if (is_at == true) {
        // 6.3.1 GET KEY TASK
        var key_task = firstLine.match(/\d/g);
        key_task = key_task.join("")
        //6.3.2 GET PROJECT NAME
        var postion_at = body_text.indexOf("@")
        var project_name = firstLine.substring(postion_at + 1).trim()
        notes_key = response_note[x]['id']
        notes_key_array.push(notes_key)

      }
      else if (idx == false) {
        notes_objects[response_note[x]['id']] = response_note[x]['body_text']
      }
      else if (status_value) {
      } else {
        var comment_value = response_note[x]['body_text']
        var result_value = comment_value.substring(comment_value.indexOf(":") + 1, comment_value.length)
        result_value = result_value.trim()
        notes_objects[response_note[x]['id']] = result_value
      }
    }
    else {
    }

  }
  information_array.push(notes_objects)
  information_array.push(key_task)
  information_array.push(project_name)
  information_array.push(notes_key_array)

  return information_array



}