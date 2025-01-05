function PrettierWSP(){
    const DISCIPLINE_SELECTOR = ".v-absolutelayout-wrapper.v-absolutelayout-wrapper-schedule-item";
    const WEEKDAY_SECTION_SELECTOR = ".v-slot.v-slot-v-border-left-1-bfbfbf";
    const WEEKDAY_HEADER_SELECTOR = WEEKDAY_SECTION_SELECTOR + " .v-label.v-widget.bold.v-label-bold.v-label-undef-w";
    const SCHEDULE_SELECTOR = ".v-slot.v-align-center.v-align-middle:has(> .v-customcomponent.v-widget.v-has-width)";
    const INFO_TABLE_SELECTOR = ".v-slot.v-align-center.v-align-middle:has(.v-information-component.v-widget)";
    const TITLE_SELECTOR = ".v-label.v-widget.v-label-undef-w";
    const WEEKDAYS_CNT = 7;
    let __lang = "en";

    const STUDY_START_HOUR = 8, STUDY_END_HOUR = 22;

    const WEEKDAY_REGEXES = [/(Пн)|(Mon)/, /(Вт)|(Tue)/, /(Ср)|(Wed)/, /(Чт)|(Thu)/, /(Пт)|(Fri)/, /(Сб)|(Sat)/, /(Вс)|(Sun)/];
    const mapIndexWeekEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mapIndexWeekRu = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    function cutDisciplineNameFromOrigTable(name) {
        document.querySelectorAll(DISCIPLINE_SELECTOR).forEach(
            el => {
                const needed = el.children[0].children[0].children[0];
                const text = needed.textContent.trim();
                if (text.includes(name))
                    needed.textContent = text.substring(name.length + 1);
            },
        );
    }

    function normalizeWeekdayNodes(weekdayNodes) {  // returns array of nodes with length 7
        const res = new Array(WEEKDAYS_CNT);
        let it = 0;

        for (let i = 0; i < WEEKDAYS_CNT; i++) {
            if (
                it < weekdayNodes.length &&
                WEEKDAY_REGEXES[i].test(weekdayNodes[it].textContent.trim())
            ) {
                res[i] = weekdayNodes[it++];
            } else {
                res[i] = null;
            }
        }

        return res;
    }

    function getWeekdayIndex(node, normalizedWeekdayNodes) {
        for (let i = 0; i < WEEKDAYS_CNT; i++) {
            if (!normalizedWeekdayNodes[i]) {
                continue;
            }

            const closestSectionToNode = node.closest(WEEKDAY_SECTION_SELECTOR);
            const closestSectionToWeekdayNode = normalizedWeekdayNodes[i].closest(WEEKDAY_SECTION_SELECTOR);
            if (closestSectionToWeekdayNode === null) {
                continue;
            }

            if (closestSectionToNode === closestSectionToWeekdayNode) {
                return i;
            }
        }
        return -1;
    }

    function formatHourRange(l, r) {  // assuming l and r are integers
        return `${l}-${r}`;
    }

    function getStartHour(disciplineNode) {
        // console.log(disciplineNode, disciplineNode.style.top);
        let styleTopPx = parseInt(disciplineNode.style.top);
        return STUDY_START_HOUR + Math.round(styleTopPx / 40);
    }

    function getEndHour(disciplineNode) {
        // console.log(disciplineNode, disciplineNode.children[0].style.height);
        let styleTopPx = parseInt(disciplineNode.style.top);
        let styleHeightPx = parseInt(disciplineNode.children[0].style.height);
        return STUDY_START_HOUR + Math.round(styleTopPx / 40) + Math.round(styleHeightPx / 40);
    }

    function groupDisciplines(disciplineNodes, weekdayNodes) {
        /*
        returns an array of objects:
        [
          {
            weekdayIndex: [0-6],
            timeRangeNodes: {
              8-9: [properDisciplineNodes],
              9-10: [properDisciplineNodes],
              ...
              21-22: [properDisciplineNodes]
            }
          }, ...
        ]
         */
        let n = disciplineNodes.length, k = weekdayNodes.length;

        const res = Array.from({ length: 7 }, (_, idx) => {
            const el = {};
            el.weekdayIndex = idx;

            el.timeRangeNodes = {};
            for (let hour = STUDY_START_HOUR; hour < STUDY_END_HOUR; hour++)
                el.timeRangeNodes[formatHourRange(hour, hour + 1)] = [];
            return el;
        });

        const normalizedWeekdayNodes = normalizeWeekdayNodes(weekdayNodes);
        for (let i = 0; i < n; i++) {
            let weekdayIndex = getWeekdayIndex(disciplineNodes[i], normalizedWeekdayNodes);
            if (weekdayIndex === -1)
                continue;
            let startHour = getStartHour(disciplineNodes[i]);
            let endHour = getEndHour(disciplineNodes[i]);

            // console.log(disciplineNodes[i], startHour, endHour);

            for (let hour = startHour; hour < endHour; hour++) {
                let formattedRange = formatHourRange(hour, hour + 1);
                const el = res.find(el => el.weekdayIndex === weekdayIndex);
                if (!el)
                    throw new Error("\"res\" array was incorrectly created");

                el.timeRangeNodes[formattedRange].push(disciplineNodes[i]);
            }
        }
        return res;
    }

    function sparsifyGroupedDisciplines(groupedDisciplines) {
        return groupedDisciplines
            .filter(obj => !!Object.values(obj.timeRangeNodes).some(nodes => nodes.length > 0));
    }

    function hideOrigSchedule() {
        if (document.querySelector(SCHEDULE_SELECTOR))
            document.querySelector(SCHEDULE_SELECTOR).style.display = "none";
    }

    function removeExtendedSchedule() {
        document.querySelector(".kanich-table")?.remove();
    }

    function renderExtendedSchedule(el) {
        document.querySelector(INFO_TABLE_SELECTOR)?.after(el);
    }

    function pushLanguage() {
        let titleEl = document.querySelector(TITLE_SELECTOR);
        if (!titleEl)
            return;
        if (titleEl.textContent.includes("Кес")) {
            __lang = "kz";
        } else if (titleEl.textContent.includes("Рас")) {
            __lang = "ru";
        } else if (titleEl.textContent.includes("Sch")) {
            __lang = "en";
        }
    }

    function handleTrElHover(ev) {
        const trEl = ev.target.closest("tr");
        if (trEl) {
            trEl.style.zIndex = "6969";
            // trEl.style.boxShadow = "0 0 0 3px #0084ff";
            trEl.style.outline = "3px solid #0084ff";
        }
    }

    function handleTrElOut(ev) {
        const trEl = ev.target.closest("tr");
        if (trEl) {
            trEl.style.zIndex = "1000";
            // trEl.style.boxShadow = "";
            trEl.style.outline = "";
        }
    }

    function createScheduleTableEl(sparseGroupedDisciplines) {
        let sparseWeekdayCnt = sparseGroupedDisciplines.length;
        const tableEl = document.createElement("table");

        tableEl.classList.add("kanich-table");
        tableEl.setAttribute("style", `
  box-sizing: border-box;

  min-width: 0.9svw;
  width: 90%;
  margin: 10px auto 0;
  padding: 0;

  border-collapse: collapse;
  
  z-index: 1000;
  
  font-weight: 600;
  /* Copyrights are reserved by Kanich */
  font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
  `);


        const theadEl = document.createElement("thead");
        theadEl.setAttribute("style", `
  `);

        for (let i = 0; i < sparseWeekdayCnt; i++) {
            const thEl = document.createElement("th");
            thEl.setAttribute("style", `
    ${i ? "border-left: 5px solid #666;" : ""}
    ${i < sparseWeekdayCnt - 1 ? "border-right: 5px solid #666;" : ""}

    text-align: center;
    `);
            if (__lang === "ru")
                thEl.textContent = mapIndexWeekRu[sparseGroupedDisciplines[i].weekdayIndex];
            else
                thEl.textContent = mapIndexWeekEn[sparseGroupedDisciplines[i].weekdayIndex];
            theadEl.append(thEl);
        }

        const tbodyEl = document.createElement("tbody");
        tbodyEl.setAttribute("style", `
  margin: 0;
  padding: 0;
  border-top: 2px solid black;
  `);

        tbodyEl.addEventListener("mouseover", handleTrElHover);
        tbodyEl.addEventListener("mouseout", handleTrElOut);

        for (let hour = STUDY_START_HOUR; hour < STUDY_END_HOUR; hour++) {
            const trEl = document.createElement("tr");
            trEl.setAttribute("style", `
    position: relative;
    margin: 0;
    padding: 0;
    border-top: 1px solid black;
    `);
            trEl.dataset.index = hour.toString();

            const timeEl = document.createElement("div");
            timeEl.setAttribute("style", `
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-2rem, -0.65rem);
    z-index: 1337;
    `);
            timeEl.textContent = `${hour.toString().padStart(2, "0")}:00`;

            for (let i = 0; i < sparseWeekdayCnt; i++) {
                const tdEl = document.createElement("td");
                tdEl.setAttribute("style", `
      min-width: 0.2svw;
      height: 100%;
      background-color: ${hour % 2 ? "#fff" : "#ccebff"};
      margin: 0;
      padding: 0;
      ${i ? "border-left: 5px solid #666" : ""};
      ${i < sparseWeekdayCnt - 1 ? "border-right: 5px solid #666" : ""};
      `);

                const innerFlexbox = document.createElement("div");
                innerFlexbox.setAttribute("style", `
      min-height: 30px;
      margin: 0;
      padding: 0;
      line-height: 1rem;

      display: flex;
      flex-flow: row nowrap;
      place-content: center;
      `);

                let formattedRange = formatHourRange(hour, hour + 1);
                let curTimeRangeDisLen = sparseGroupedDisciplines[i].timeRangeNodes[formattedRange].length;

                for (let j = 0; j < curTimeRangeDisLen; j++) {
                    const newDisciplineEl = document.createElement("div");
                    newDisciplineEl.setAttribute("style", `
        height: 100%;
        margin: 0;
        padding: 5px;

        flex: 1 1 auto;

        ${j ? "border-left: 1px solid #525e66;" : ""}
        ${j < curTimeRangeDisLen - 1 ? "border-right: 1px solid #525e66;" : ""}
        
        text-align: center;
        `);

                    newDisciplineEl.textContent = sparseGroupedDisciplines[i].timeRangeNodes[formattedRange][j].textContent;
                    innerFlexbox.append(newDisciplineEl);
                }

                tdEl.append(timeEl);
                tdEl.append(innerFlexbox);
                trEl.append(tdEl);
            }
            tbodyEl.append(trEl);
        }


        tableEl.append(theadEl);
        tableEl.append(tbodyEl);
        return tableEl;
    }

    function __main() {
        function tick() {
            removeExtendedSchedule();
            pushLanguage();

            let disciplineName = document
                .querySelector(INFO_TABLE_SELECTOR)
                ?.querySelector("table tbody tr:nth-child(2) td:nth-child(2)")
                ?.textContent.trim();

            if (disciplineName)
                cutDisciplineNameFromOrigTable(disciplineName);

            const groupedDisciplines = groupDisciplines(
                [...document.querySelectorAll(DISCIPLINE_SELECTOR)],
                [...document.querySelectorAll(WEEKDAY_HEADER_SELECTOR)],
            );

            // console.log([...document.querySelectorAll(DISCIPLINE_SELECTOR)], [...document.querySelectorAll(WEEKDAY_HEADER_SELECTOR)]);

            const sparseGroupedDisciplines = sparsifyGroupedDisciplines(groupedDisciplines);

            // console.log(groupedDisciplines);
            // console.log(sparseGroupedDisciplines);

            const tableEl = createScheduleTableEl(
                sparseGroupedDisciplines.length ? sparseGroupedDisciplines : groupedDisciplines  // if schedule is empty, display all week days
            );
            hideOrigSchedule();
            renderExtendedSchedule(tableEl);
        }

        window.addEventListener("popstate", ev => {
            let intervalId = setInterval(() => {
                if (document.querySelector(INFO_TABLE_SELECTOR)) {
                    tick();
                    clearInterval(intervalId);
                }
            }, 20);
        });
        tick();
    }

    __main();
    new Promise(resolve => setTimeout(resolve, 1000));
    javascript:(() => {const highlightNames = () => {const nameColorMap = {}; const getRandomColor = () => {let color = "#"; for (let i = 0; i < 6; i++) color += "0123456789ABCDEF"[Math.floor(Math.random() * 16)]; return color;}; const extractName = (text) => (text.match(/^[^\.]+\.[^\.]+\./) || [])[0]?.trim() || text.trim(); document.querySelectorAll("td div div").forEach(element => {const fullText = element.textContent.trim(), baseName = extractName(fullText); if (!nameColorMap[baseName]) nameColorMap[baseName] = getRandomColor(); element.style.color = nameColorMap[baseName];}); console.log(nameColorMap);}; highlightNames();})();;
}

module.exports = {
    PrettierWSP
}