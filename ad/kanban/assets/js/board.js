let projectInfo = {};
let allIssues = [];
let metadata = {};

// Handlebars Helpers
Handlebars.registerHelper('default', (value, fallback) => {
    return (value !== undefined && value !== null && value !== '') ? value : fallback;
});

Handlebars.registerHelper('localeDate', (dateString, locale) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat(locale).format(new Date(dateString));
});

Handlebars.registerHelper('initiativeFgColor', (issue) => {
    const normalizedLabel = normalizeLabel(issue.initiative.name);
    const fgColor = labelColors[normalizedLabel] || "hsl(210, 100%, 50%)";
    return fgColor;
});

Handlebars.registerHelper('initiativeBgColor', (issue) => {
    const normalizedLabel = normalizeLabel(issue.initiative.name);
    const fgColor = labelColors[normalizedLabel] || "hsl(210, 100%, 50%)";
    return bgColorForHSL(fgColor);
});


Handlebars.registerHelper('localDateTime', (dateString, locale = 'es-ES') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    // Format date and time without seconds
    const formatted = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
    // Replace comma separator with space
    return formatted.replace(',', '');
});


Handlebars.registerHelper('localdatetime', (dateString, locale = 'es-ES') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
});

Handlebars.registerHelper('splitLabels', function (labelsString, options) {
    if (!labelsString) return ''; // empty string
    const labels = labelsString.split(',').map(l => l.trim()); // split & trim
    let result = '';
    labels.forEach(label => {
        result += options.fn({ label });
    });
    return result;
});

Handlebars.registerHelper('reactionBadge', function (reactions, key) {
    if (!reactions || reactions[key] <= 0) return '';

    const emojiMap = {
        "+1": "👍",
        "-1": "👎",
        "laugh": "😄",
        "hooray": "🎉",
        "confused": "😕",
        "heart": "❤️",
        "rocket": "🚀",
        "eyes": "👀"
    };

    if (!emojiMap.hasOwnProperty(key)) return '';

    return new Handlebars.SafeString(
        `<span class="reaction-modal">${emojiMap[key]} ${reactions[key]}</span>`
    );
});

Handlebars.registerHelper('labelBgColor', function (label) {
    if (!label) return '#999'; // fallback gray for empty label
    return labelColorsMap[label.toLowerCase()] || '#999'; // fallback gray for unknown labels
});

const priorityMap = {
    'P1': 1,
    'P2': 2,
    'P3': 3,
    'P4': 4,
    'P5': 5
};

Handlebars.registerHelper('priorityNumber', (priority) => {
    if (!priority) return '';

    return priorityMap[priority.toUpperCase()] ?? '';
});

function priorityColor(priority) {
    const num = priorityMap[(priority || '').toUpperCase()] ?? 1;

    // Calculate a blue gradient from light to dark
    // HSL: hue=220 (blue), saturation=80%, lightness varies by priority
    //const lightness = 80 - (num - 1) * 12; // P1=80%, P5=32%
    const lightness = 100 - 15 * num;
    return `hsl(192, 100%, ${lightness}%)`;
}

Handlebars.registerHelper('priorityColor', (priority) => {
    return priorityColor(priority);
});

Handlebars.registerHelper('gte', (a, b) => {
    return Number(a) >= Number(b);
});

Handlebars.registerHelper('kanbanColor', (status) => {
    const normalizedStatus = normalizeStatus(status);
    return kanbanColorMap[normalizedStatus] || '#999'; // fallback gray
});

async function loadIssues() {
    try {
        const resp = await fetch('assets/ghboard.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        allIssues = data.issues;
        console.log(`Loaded ${allIssues.length} issues`);
        console.log(data.issues);
        projectInfo = data.project;
        metadata = data.metadata || {};
        renderIssues();
    } catch (err) {
        console.error(err);
        console.error("Failed to load issues.json. Are you running via http:// ?");
    }
}

function normalizeStatus(status) {
    return (status || '').toLowerCase();
}

// Color mappings for Proyectos / Iniciativas
const labelColors = {
    "votum": "hsl(0, 100%, 40%)",
    "unirioja.es": "hsl(360, 100%, 40%)",
    "feature": "hsl(204, 70%, 53%)",            // blue (#3498db)
    "gravitas": "hsl(262, 100%, 64%)",
    "ae": "hsl(262, 100%, 64%)",
    "civitas": "hsl(145, 63%, 49%)",
    "sede": "hsl(145, 63%, 49%)",
    "talos": "hsl(270, 48%, 52%)",
    "research": "hsl(282, 39%, 52%)",           // purple (#9b59b6)
    "geiser": "hsl(33, 89%, 53%)",
    "age": "hsl(33, 89%, 53%)",
    "consilium": "hsl(217, 94%, 58%)",
    // add more labels/colors as needed
};

const emojiMap = {
    "+1": "👍",
    "-1": "👎",
    "laugh": "😄",
    "hooray": "🎉",
    "confused": "😕",
    "heart": "❤️",
    "rocket": "🚀",
    "eyes": "👀"
};

const labelColorsMap = {
    "bug": "#e74c3c",           // red
    "enhancement": "#3498db",   // blue
    "feature": "#2ecc71",       // green
    "documentation": "#f39c12", // orange
    // add more labels as needed
};

const kanbanColorMap = {
    "pending": "#6d799a",
    "doing": "#9c49d0",   // purple
    "done": "#65c156",    // green
    "blocked": "#ff9006"  // orange
};

/**
 * Generate a lighter background color from an HSL text color string
 * @param {string} foreColorStr - HSL string, e.g., "hsl(0, 0%, 96%)"
 * @returns {string} - Background color as HSL string
 */
function bgColorForHSL(foreColorStr) {
    // Extract numbers from HSL string
    const match = foreColorStr.match(/hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\s*\)/i);
    if (!match) {
        throw new Error("Invalid HSL color format");
    }

    let h = parseInt(match[1], 10);
    let s = parseInt(match[2], 10);
    let l = parseInt(match[3], 10);

    // Create light pastel background
    const bgHsl = {
        h: h,                  // keep same hue
        s: Math.max(20, s - 30), // reduce saturation
        l: Math.min(95, l + 50)  // increase lightness
    };

    return `hsl(${Math.round(bgHsl.h)}, ${Math.round(bgHsl.s)}%, ${Math.round(bgHsl.l)}%)`;
}


function normalizeLabel(label) {
    if (!label) return '';
    return label
        .trim()                         // remove leading/trailing spaces
        .toLowerCase()                  // convert to lowercase
        .normalize('NFD')               // decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/\s+/g, '');
}

function formatShortDateES(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return ''; // <- prevents "Invalid time value"
    return new Intl.DateTimeFormat('es-ES').format(date);
}

function formatDateTimeES(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return ''; // <- prevents "Invalid time value"
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).format(date);
}

function issueCard(issue) {
    let initiativeTitle = issue.initiative.description ? issue.initiative.description : issue.initiative.name;
    initiativeTitle = initiativeTitle ? initiativeTitle : 'Untitled';
    const commentCount = Array.isArray(issue.comments) ? issue.comments.length : 0;
    const normalizedLabel = normalizeLabel(issue.initiative.name);
    const fgColor = labelColors[normalizedLabel] || "hsl(210, 100%, 50%)";
    const bgColor = bgColorForHSL(fgColor);
    if (!issue.priority) issue.priority = 'P3'; // default priority
    const priorityNumber = priorityMap[issue.priority.toUpperCase()] ?? '';

    return `
        <div class="kanban-card box box-widget" onclick="openIssue(${issue.number})">
            <div style="margin: 8px;">
                  <span class="badge" style="text-transform: uppercase; 
                    background-color: ${bgColor}; color: ${fgColor};
                    padding: 4px 8px;">
                    <i class="fa fa-circle-o"></i>
                    ${initiativeTitle}
                </span>
            </div>
            <div class="box-header with-border" style="padding-top: 0">
                ${issue.title}
                <div style="margin-top: 6px; color:#666">
                    ${issue.subtitle}
                </div>
            </div>
            <div class="box-body">
                <div style="color:#666; margin: 0 0 6px 0; font-weight:700;">
                    <i class="fa fa-fw fa-tags"></i> ${issue.issueType.name || 'Tarea'}
                    <div class="pull-right">
                        <div class="priority-container">     
                            <span class="square square-mini ${priorityNumber >= 1 ? 'active' : ''}"></span>
                            <span class="square square-mini ${priorityNumber >= 2 ? 'active' : ''}"></span>
                            <span class="square square-mini ${priorityNumber >= 3 ? 'active' : ''}"></span>
                            <span class="square square-mini ${priorityNumber >= 4 ? 'active' : ''}"></span>
                            <span class="square square-mini ${priorityNumber >= 5 ? 'active' : ''}"></span>
                            <span style="color: #ccc; margin-left: 2px; padding-top: 2px;">${issue.priority}</span>
                        </div>
                    </div>    
                </div>
                <div class="box-bottom" style="color:#999">
                    <i class="fa fa-fw fa-calendar-o" aria-hidden="true"></i>
                    ${formatDateTimeES(issue.updated_at)}h                  
                    <div class="pull-right" style="${commentCount === 0 ? 'display: none;' : ''}">
                        <i class="fa fa-comment-o"></i> ${commentCount} ${commentCount === 1 ? 'comentario' : 'comentarios'}
                    </div>
                </div>
            </div>
        </div>`;
}

function openIssue(number) {
    const issue = allIssues.find(i => i.number == number);
    if (!issue) return;
    document.getElementById('issueModal')?.remove();

    const tpl = document.getElementById('issue-modal-template').innerHTML;
    const template = Handlebars.compile(tpl);
    const html = template({ issue });

    document.body.insertAdjacentHTML('beforeend', html);
    $('#issueModal').modal('show');
}

function renderIssues() {
    const search = document.getElementById('searchBox').value.toLowerCase();
    const label = document.getElementById('labelFilter').value.toLowerCase();
    const cols = {
        pending: document.getElementById('kanban-pending'),
        doing: document.getElementById('kanban-doing'),
        done: document.getElementById('kanban-done'),
        blocked: document.getElementById('kanban-blocked')
    };
    Object.values(cols).forEach(c => c.innerHTML = '');
    const counts = { pending: 0, doing: 0, done: 0, blocked: 0 };

    document.getElementById('project-name').innerText = projectInfo.name;
    document.getElementById('project-description').innerText = projectInfo.description;
    document.getElementById('project-readme_html').innerHTML = projectInfo.readme_html;
    document.getElementById('last-updated').innerText = metadata.timestamp
        ? formatDateTimeES(metadata.timestamp) + 'h'
        : '--';

    for (const issue of allIssues) {
        if (search && !issue.title.toLowerCase().includes(search)) continue;
        if (label && !issue.labels.toLowerCase().includes(label)) continue;

        const status = normalizeStatus(issue.status);
        if (status.includes('pending')) {
            cols.pending.innerHTML += issueCard(issue); counts.pending++;
        } else if (status.includes('doing') || status.includes('progress')) {
            cols.doing.innerHTML += issueCard(issue); counts.doing++;
        } else if (status.includes('done')) {
            cols.done.innerHTML += issueCard(issue); counts.done++;
        } else if (status.includes('blocked')) {
            cols.blocked.innerHTML += issueCard(issue); counts.blocked++;
        }
    }

    document.getElementById('count-pending').innerText = counts.pending;
    document.getElementById('count-doing').innerText = counts.doing;
    document.getElementById('count-done').innerText = counts.done;
    document.getElementById('count-blocked').innerText = counts.blocked;
    document.getElementById('count-total').innerText = counts.pending + counts.doing + counts.done + counts.blocked;
}

window.addEventListener("load", async () => {
    // Simula carga de JS / datos
    await loadIssues();

    const loader = document.getElementById("spinner-loader");
    const content = document.getElementById("kanban-board");

    loader.classList.remove("show");

    setTimeout(() => {
        loader.style.display = "none";
        content.style.display = "block";
        content.classList.add("show");
    }, 400);

    
});


document.getElementById('searchBox').addEventListener('input', renderIssues);
document.getElementById('labelFilter').addEventListener('input', renderIssues);
// document.addEventListener('DOMContentLoaded', loadIssues);

