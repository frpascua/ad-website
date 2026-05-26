(function () {
    'use strict';

    // Get URL parameter
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Load and render GitLab issues
    async function loadGitLabIssues() {
        try {
            const response = await fetch('assets/gitlab-issues.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Loaded GitLab issues:', data);

            // Check for milestone parameter
            const milestoneParam = getUrlParameter('milestone');
            let filteredIssues = data.issues;
            let selectedMilestone = null;

            if (milestoneParam) {
                // Filter issues by milestone
                filteredIssues = data.issues.filter(issue =>
                    issue.milestone && issue.milestone.title === milestoneParam
                );

                // Find the milestone object
                if (filteredIssues.length > 0) {
                    selectedMilestone = filteredIssues[0].milestone;
                }

                console.log(`Filtered ${filteredIssues.length} issues for milestone: ${milestoneParam}`);
            }

            renderIssues(filteredIssues);
            renderProjectInfo(data.project);
            renderMilestoneInfo(selectedMilestone);
        } catch (error) {
            console.error('Error loading GitLab issues:', error);
            const container = document.getElementById('gitlab-issues');
            if (container) {
                container.innerHTML = `<div class="alert alert-danger">Failed to load issues: ${error.message}</div>`;
            }
        }
    }

    // Render issues list
    function renderIssues(issues) {
        const container = document.getElementById('gitlab-issues');
        if (!container) {
            console.error('Container element #gitlab-issues not found');
            return;
        }

        if (!issues || issues.length === 0) {
            container.innerHTML = '<p>No issues found.</p>';
            return;
        }
        document.getElementById('aside-total-issues').textContent = issues.length;
        document.getElementById('issue-progress-bar').style.width = `${(issues.filter(issue => issue.state === 'closed').length / issues.length) * 100}%`;
        const hueColor = (issues.filter(issue => issue.state === 'closed').length / issues.length) * 120;
        document.getElementById('issue-progress-bar').style.backgroundColor = `hsl(${hueColor}, 100%, 32%)`;
        if (hueColor > 120) {
            document.getElementById('issue-progress-bar').style.backgroundColor = `hsl(192, 100%, 32%)`;
        }
        document.getElementById('aside-total-issues').style.color = document.getElementById('issue-progress-bar').style.backgroundColor;

        // Group issues by "feat::" labels
        const groupedIssues = {};
        const ungroupedIssues = [];
        const featLabels = []; // Array to store labels used for grouping

        issues.forEach(issue => {
            const featLabel = issue.labels.find(label => label.name.startsWith('feat::'));
            if (featLabel) {
                const groupName = featLabel.name;
                if (!groupedIssues[groupName]) {
                    groupedIssues[groupName] = {
                        label: featLabel,
                        issues: []
                    };
                    featLabels.push(featLabel); // Add to featLabels array
                }
                groupedIssues[groupName].issues.push(issue);
            } else {
                ungroupedIssues.push(issue);
            }
        });

        // Render navigation of feature labels
        renderFeaturesNav(featLabels);

        let html = '';

        // Render grouped issues
        Object.keys(groupedIssues).sort().forEach(groupName => {
            const group = groupedIssues[groupName];
            const anchorId = 'feat-' + group.label.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            html += `
                <section id="${anchorId}" style="margin-bottom: 50px;">
                    <h2 style="font-size: 36px; border-bottom: 2px solid ${group.label.color || '#999'}; padding-bottom: 10px; margin-bottom: 30px;">
                        <span style="background-color: ${group.label.color || '#999'}; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 24px;">
                            ${escapeHtml(group.label.description || group.label.name)}
                        </span>
                    </h2>
            `;

            group.issues.forEach(issue => {
                html += renderIssue(issue);
            });

            html += '</section>';
        });

        // Render ungrouped issues
        if (ungroupedIssues.length > 0) {
            html += `
                <section style="margin-bottom: 50px;">
                    <h2 style="font-size: 36px; border-bottom: 2px solid #CCC; padding-bottom: 10px; margin-bottom: 30px;">
                        Otros
                    </h2>
            `;

            ungroupedIssues.forEach(issue => {
                html += renderIssue(issue);
            });

            html += '</section>';
        }

        container.innerHTML = html;
    }

    // Render a single issue
    function renderIssue(issue) {
        const stateClass = issue.state === 'closed' ? 'label-success' : 'label-primary';
        const stateBgColor = issue.state === 'closed' ? '#00A65A' : '#3C8DBC';

        const labels = issue.labels.map(label =>
            `<span class="label" style="background-color: ${label.color || '#999'}; color: #fff; padding: 2px 6px; margin-right: 4px; border-radius: 3px;">
                    ${escapeHtml(label.description || label.name)}
                </span>`
        ).join(' ');

        const assignees = issue.assignees.map(assignee =>
            `<span class="assignee" title="${escapeHtml(assignee.name)}" style="margin-right: 8px;">
                    <img src="${escapeHtml(assignee.avatar_url)}" alt="${escapeHtml(assignee.username)}" width="20" height="20" style="border-radius: 50%; vertical-align: middle;">
                    ${escapeHtml(assignee.username)}
                </span>`
        ).join(' ');

        const milestone = issue.milestone ?
            `<span class="label label-info">${escapeHtml(issue.milestone.title)}</span>` : '';

        // Calculate priority weight (1-5 scale, defaulting to 3 if no weight)
        const priorityLevel = issue.weight || 3;
        const priorityBoxes = Array.from({ length: 5 }, (_, i) => {
            const isActive = i < priorityLevel;
            const bgColor = isActive ? `hsl(192, 100%, ${100 - 15 * priorityLevel}%)` : '#D2D6DE';
            return `<div style="background-color: ${bgColor}; float: left; height: 12px; width: 12px; margin-right: 1px;"></div>`;
        }).join('');

        return `
                <section style="border-bottom: solid 1px #CCC; margin-bottom: 30px;">
                    <div class="row">
                        <div class="col-md-12">
                            <div>
                            <div style="float: right; text-align: right; margin-left: 10px;">
                            <span class="label" style="padding: 2px 4px; font-size: 12px; text-transform: uppercase; background-color: ${stateBgColor};">
                                ${escapeHtml(issue.state)}
                            </span>
                            </div>
                            <h3 style="font-weight: 700; margin: 0;">
                                <a href="${escapeHtml(issue.web_url)}" target="_blank" style="color: #333;">
                                    ${escapeHtml(issue.title)}
                                </a>
                            </h3>
                            </div>
                           
                            <div style="margin-bottom: 4px;">
                                <div style="color: #999; font-size: .9em;">
                                    <b>#${issue.iid}</b>
                                    <span style="margin-left: 20px;">
                                        <i class="fa fa-fw fa-clock-o" aria-hidden="true"></i>
                                        <b>Created:</b>
                                        ${formatDate(issue.created_at)}
                                    </span>
                                    <span style="margin-left: 20px;">
                                        <i class="fa fa-fw fa-clock-o" aria-hidden="true"></i>
                                        <b>Updated:</b>
                                        ${formatDate(issue.updated_at)}
                                    </span>
                                    ${issue.closed_at ? `
                                        <span style="margin-left: 20px;">
                                            <i class="fa fa-fw fa-check" aria-hidden="true"></i>
                                            <b>Closed:</b>
                                            ${formatDate(issue.closed_at)}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                       
                       
                    </div>
                   
                    <div style="margin-top: 10px; margin-bottom: 10px;">
                        <div class="issue-priority-boxes no-print" style="" title="Prioridad: ${issue.weight || 'N/A'}">
                            <div style="line-height: 12px; letter-spacing: 0px;">
                                <div style="margin-right: 20px; font-size: .9em;">
                                    <div style="float: left; margin-right: 4px; color: #666">
                                        <b> Priority: </b>
                                    </div>
                                    ${priorityBoxes}
                                </div>
                            </div>
                        </div>
                        <div class="clearfix"></div>

                        ${assignees ? `
                            <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                                <b>Assigned:</b> ${assignees}
                            </div>
                        ` : ''}

                        ${issue.due_date ? `
                            <div style="margin-top: 5px; font-size: 0.9em; color: #666;">
                                <i class="fa fa-fw fa-calendar" aria-hidden="true"></i>
                                <b>Due date:</b> ${formatDate(issue.due_date)}
                            </div>
                        ` : ''}

                        ${issue.description_html ? `
                            <div style="font-weight: 600; color: #444; margin-top: 10px;">
                                ${issue.description_html}
                            </div>
                        ` : ''}
                    </div>
                    <div>
                    ${milestone}
                    ${labels}
                    </div>
                </section>
            `;
    }

    // Render project info
    function renderProjectInfo(project) {

        if (!project) {
            container.innerHTML = '<p>No project information available.</p>';
            return;
        }

        document.getElementById('project-description').textContent = escapeHtml(project.description) || '';

        document.getElementById('aside-project-info').innerHTML = `
            <p><strong>Project:</strong> ${project.name} &nbsp;</p>
            <p><strong>ID:</strong> ${escapeHtml(project.id || '')}</p>
            <p><strong>GitLab repo:</strong> <a href="${escapeHtml(project.web_url)}" target="_blank">${escapeHtml(project.web_url)}</a></p>
            `;
    }

    // Render milestone info
    function renderMilestoneInfo(milestone) {
        const container = document.getElementById('milestone-info');
        if (!container) {
            console.error('Container element #milestone-info not found');
            return;
        }

        if (!milestone) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <h2>   
                Versi&oacute;n ${escapeHtml(milestone.title)}
            </h2>
                <div style="font-weight: bold; ">
                    
                    <p>${milestone.description_html ? milestone.description_html : ''}</p>
                </div>`;

        let asideHtml = `
            <div>   
                <strong>Versi&oacute;n:</strong> ${escapeHtml(milestone.title)}
            </div>
            <div style="font-size: 13px; color: #666;">
                ${milestone.created_at ? `<div><strong>Created:</strong> ${formatDate(milestone.created_at)}</div>` : ''}
                ${milestone.due_date ? `<div><strong>Due date:</strong> ${formatDate(milestone.due_date)}</div>` : ''}
            </div>
        `;
        document.getElementById('aside-milestone-info').innerHTML = asideHtml;
        container.innerHTML = html;
    }

    // Render features navigation
    function renderFeaturesNav(featLabels) {
        const container = document.getElementById('aside-features-nav-wrapper');
        if (!container) {
            console.error('Container element #aside-features-nav-wrapper not found');
            return;
        }

        if (!featLabels || featLabels.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Sort labels alphabetically
        const sortedLabels = [...featLabels].sort((a, b) => a.name.localeCompare(b.name));

        let html = '<ol>';
        sortedLabels.forEach(label => {
            // Create an anchor-friendly ID from the label name
            const anchorId = 'feat-' + label.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            html += `
                <li>
                    <a href="#${anchorId}" style="color: ${label.color || '#333'};">
                        ${escapeHtml(label.description || label.name)}
                    </a>
                </li>
            `;
        });
        html += '</ol>';

        container.innerHTML = html;
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGitLabIssues);
    } else {
        loadGitLabIssues();
    }
})();
