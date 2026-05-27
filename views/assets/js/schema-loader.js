/**
 * Schema Loader - Loads schema.json and populates tables dynamically
 */
(function() {
    'use strict';

    /**
     * Fetch and parse schema.json
     * @returns {Promise<Object>} Schema data
     */
    function fetchSchema() {
        return fetch('/views/assets/js/schema.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load schema.json');
                }
                return response.json();
            });
    }

    /**
     * Extract and sort items from schema section
     * @param {Object} items - Schema section (e.g., schema.projects)
     * @returns {Array} Sorted array of items with title, summary, and url
     */
    function extractAndSortItems(items) {
        if (!items) {
            return [];
        }

        const itemList = [];
        Object.keys(items).forEach(key => {
            const item = items[key];
            
            // Skip if not a file (could be a subfolder)
            if (!item.url) {
                return;
            }

            const frontmatter = item.frontmatter || {};
            const title = frontmatter.title || key;
            const summary = frontmatter.summary || '';
            const url = item.url;

            itemList.push({ title, summary, url });
        });

        // Sort by title alphabetically
        itemList.sort((a, b) => a.title.localeCompare(b.title));
        
        return itemList;
    }

    /**
     * Create a table row element
     * @param {Object} item - Item with title, summary, url
     * @returns {HTMLElement} Table row element
     */
    function createTableRow(item) {
        const tr = document.createElement('tr');
        tr.className = 'ka-table__row';

        // Create header cell with link
        const th = document.createElement('th');
        th.scope = 'row';
        th.className = 'ka-table__header';
        const link = document.createElement('a');
        link.href = '/app' + item.url;
        link.textContent = item.title;
        th.appendChild(link);

        // Create description cell
        const td = document.createElement('td');
        td.className = 'ka-table__cell';
        td.textContent = item.summary;

        // Append cells to row
        tr.appendChild(th);
        tr.appendChild(td);

        return tr;
    }

    /**
     * Populate a table with items from schema
     * @param {string} tableId - ID of the table element
     * @param {string} schemaKey - Key in schema object (e.g., 'projects', 'procedures')
     * @param {Object} schema - Full schema object
     */
    function populateTable(tableId, schemaKey, schema) {
        const table = document.getElementById(tableId);
        if (!table) {
            return; // Table not present on this page
        }

        const tbody = table.querySelector('.ka-table__body');
        if (!tbody) {
            console.error(`Table body not found for ${tableId}`);
            return;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        // Get items from schema
        const items = schema[schemaKey];
        if (!items) {
            console.warn(`No ${schemaKey} found in schema`);
            return;
        }

        // Extract and sort items
        const itemList = extractAndSortItems(items);

        // Create and append rows
        itemList.forEach(item => {
            const row = createTableRow(item);
            tbody.appendChild(row);
        });
    }

    /**
     * Load schema and populate all tables
     */
    function loadTablesFromSchema() {
        fetchSchema()
            .then(schema => {
                populateTable('projects-table', 'projects', schema);
                populateTable('procedures-table', 'procedures', schema);
            })
            .catch(error => {
                console.error('Error loading schema:', error);
            });
    }

    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadTablesFromSchema);
    } else {
        loadTablesFromSchema();
    }
})();
