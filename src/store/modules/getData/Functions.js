// FIXME: Сделать минимальную ширину инпута в хедере, когда он пустой, что бы было видно плейсхолдер

/**********************************\
  ПОЛУЧЕНИЕ СТОЛОВ И СПИСКОВ ЗАДАЧ 
\**********************************/

import * as firebase from "firebase";

export default {
  actions: {
    // ПОЛУЧЕНИЕ НАЧАЛЬНЫХ ДАННЫХ ЮЗЕРА
    getUserData({ rootState, dispatch }) {
      return new Promise((resolve, reject) => {
        const uId = rootState.userId;

        firebase
          .database()
          .ref("users/" + uId)
          .once("value")
          .then(data => {
            let userData = data.val();
            resolve(userData);
          })

          .catch(error => {
            console.log("getUserData - ошибка: ", error);
            reject();
          });
      });
    },

    // ПОЛУЧАЕМ СТОЛЫ
    getUserTables({ rootState }) {
      return new Promise((resolve, reject) => {
        rootState.appLog.push("столыaa");

        const userId = rootState.userId;

        firebase
          .database()
          .ref("tables")
          .orderByChild("userId")
          .equalTo(userId)
          .once("value")
          .then(data => {
            rootState.appLog.push("столы");

            const userTablesObject = data.val();
            let userTablesArray = [];

            // for (var prop in objLists) {
            //   userTaskLists.push(
            //     objLists[prop]
            //   );
            // }

            // Преобразуем в массив столы
            for (var tableKey in userTablesObject) {
              let tablesInArray = userTablesArray.push(
                userTablesObject[tableKey]
              );

              // Допишем свойства в этот стол
              let lastTable = userTablesArray[tablesInArray - 1];
              const tableUrl = lastTable.id.slice(lastTable.id.length - 6);

              lastTable.tableUrl = tableUrl;
            }

            rootState.appLog.push("Записали столы", userTablesArray);

            // dispatch("pushActiveTableLink");
            resolve(userTablesArray);
          })
          .catch(error => {
            console.log("Полный провал. Ошибка: ", error);
            rootState.appLog.push(
              "Ошибка на этапе: Получили столы юзера " + error
            );
          });
      });
    },

    // ПОЛУЧАЕМ СПИСКИ ЗАДАЧ
    getTableTaskLists({ commit, rootState }) {
      return new Promise((resolve, reject) => {
        const userId = rootState.userId;
        const tables = rootState.allTasks;

        // Если столов нет - первываем
        // if (!rootState.allTasks) {
        //   rootState.appLog.push("Загрузка стола завершена. У стола нет списков.");
        //   reject()
        // }

        // Получаем все списки юзера
        firebase
          .database()
          .ref("taskLists")
          .orderByChild("userId")
          .equalTo(userId)
          .once("value")
          .then(data => {
            let objLists = data.val();

            // Если ничего не получили, то прерываем
            if (!objLists) reject();

            //Преобразуем объект в массив
            let userTaskLists = [];
            for (var prop in objLists) {
              userTaskLists.push(objLists[prop]);
            }

            resolve(userTaskLists);
            // Присвоим каждому столу свои списки
            // console.log('Преобразовали в массив', userTaskLists)
            // let allTasks = rootState.allTasks;

            // allTasks.forEach((table, index) => {
            //   // Выбираем списки содержащие id стола
            //   let fittedTaskLists = userTaskLists.filter(function (oneTaskList) {
            //     return table.id === oneTaskList.tableId
            //   })
            //   console.log('Нафильтровали списков', fittedTaskLists, table.id, userTaskLists);
            // })

            // for (let taskListId in userTaskLists) {
            //   let taskListTableId = userTaskLists[taskListId].tableId
            //   let taskList = userTaskLists[taskListId]
            //   let asd = allTasks.filter(table => table.id == taskListTableId)
            //   // console.log('язь', asd)
            //   allTasks.forEach(table => {
            //     // console.log('Итерация поиска подходящего стола', table.id, taskListTableId)

            //     if (table.id === taskListTableId) {
            //       table.taskLists.push(taskList);
            //       // console.log('Сошлось-запушили', allTasks)
            //     }
            //   })
            // }

            // list.push({
            //   id: listId,
            //   tableId: activeTableId,
            //   name: data.val().name,
            //   color: data.val().color,
            //   tasks: [],
            //   listIndex: data.val().listIndex,
            //   emojiIndex: data.val().emojiIndex
            // });
          })
          .catch(error => {
            console.log("Полный провал. Ошибка: ", error);
            rootState.appLog.push(
              "Ошибка на этапе получения списков задач юзера"
            );
          });

        rootState.appLog.push("Получили списки задач юзера");
      });
    },

    // ПОЛУЧАЕМ ЗАДАЧИ
    getTasks({ rootState }) {
      return new Promise((resolve, reject) => {
        const userId = rootState.userId;

        firebase
          .database()
          .ref("tasks")
          .orderByChild("userId")
          .equalTo(userId)
          .once("value")
          .then(data => {
            let userTasksObj = data.val();

            //Преобразуем объект в массив
            let userTasksArray = [];
            for (var prop in userTasksObj) {
              userTasksArray.push(userTasksObj[prop]);
            }
            console.log("Задачи отправляю", userTasksArray);

            resolve(userTasksArray);
          })
          .catch(error => {
            console.log("Полный провал. Ошибка получения задач: ", error);
          });
      });
    },

    // ЗАПИСЫВАЕМ НАСТРОЙКИ
    getSettings({ rootState }, settings) {
      return new Promise((resolve, reject) => {
        let localSettings = settings;

        if (typeof settings == "undefined") {
          localSettings = {};
        }

        let bgImg = localSettings.bg;
        if (typeof localSettings.bg == "undefined") {
          bgImg = "/img/bg/stm-bg-2.jpg";
        }

        rootState.currentBgImg = bgImg;
        rootState.activeTableIndex = localSettings.activeTable;

        rootState.appLog.push("getSettings - Получили настройки");
        resolve();
      });
    },

    // ГРУПИРОВКА ПОЛУЧЕННЫХ ДАННЫЙ
    groupData({ rootState }, { tables = [], taskLists = [], tasks = [] }) {
      return new Promise((resolve, reject) => {
        // 1. Все списки разбирают свои задач
        taskLists.forEach((oneTaskList, index) => {
          // Выбираем задачи содержащие id списка
          let filtedTasks = tasks.filter(function(oneTask) {
            return oneTaskList.id === oneTask.taskListId;
          });
          // Пишем задачи в список
          taskLists[index].tasks = filtedTasks;
        });

        // 2. Все столы разбирают свои списки
        tables.forEach((oneTable, index) => {
          // Выбираем задачи содержащие id списка
          let filteredTaskLists = taskLists.filter(function(oneTaskList) {
            return oneTable.id === oneTaskList.tableId;
          });
          // Пишем списки к столу
          tables[index].taskLists = filteredTaskLists;
        });

        resolve(tables);
      });
    }
  }
};
