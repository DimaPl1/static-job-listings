document.addEventListener('DOMContentLoaded', () => {
    const listWrapper = document.querySelector('#job-listing'),
          filterWrapper = document.querySelector('#filter-wrapper'),
          filterBlock = document.querySelector('#filter-block'),
          clearAllItems = document.querySelector('#clear-item');

    filterWrapper.style.display = 'none';

    async function loadJSON(path) {
        try {
            const response = await fetch(path);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }


    async function getData() {
        try {
            const data = await loadJSON('data.json');
            // Обрабатываем результат здесь
            data.forEach(item => {
                const items = `
                    <li class="job-listing__item" data-id=${item.id}>
                        <div class="item-content item-content__left">
                        <img class="item-content__left-logo" src=${item.logo} alt="photosnap logo">
                        <div class="item-content-listing">
                            <div class="item-content-listing__flex">
                            <div class="item-content-listing__company">${item.company}</div>
                            ${item.new === true ? `<div class="item-content-listing__new">New!</div>` : ''}
                            ${item.featured === true ? `<div class="item-content-listing__featured">Featured</div>` : ''}
                            </div>
                            <div class="item-content-listing__position">${item.position}</div>
                            <ul class="item-content-listing__about">
                            <li class="item-content-listing__posted-at">${item.postedAt}</li> 
                            <li class="item-content-listing__contract">${item.contract}</li> 
                            <li class="item-content-listing__location">${item.location}</li> 
                            </ul>
                        </div>
                        </div>
                        <ul class="item-content item-content__right">
                        <li class="item-content__right-btn" data-role=${item.role}>${item.role}</li>
                        <li class="item-content__right-btn" data-level=${item.level}>${item.level}</li>
                        ${item.languages.map(language => `<li class="item-content__right-btn" data-language=${language}>${language}</li>`).join('')}
                        ${item.tools.map(tool => `<li class="item-content__right-btn" data-tool=${tool}>${tool}</li>`).join('')}
                        </ul>
                    </li>
                `;
                listWrapper.innerHTML += items;
                
                // Функция с фильтрацией
                const handleClick = (e) => {
                    let target = e.target;
                    if (target.classList.contains('item-content__right-btn') && target.closest('.job-listing__item').dataset.id == item.id){
                        addToFilter(data, e);
                    }
                };
                document.addEventListener('click', handleClick);
            });
        } catch (error) {
            console.error(error);
        }
    }
    getData();


    function addToFilter(data, e) {
        const listings = document.querySelectorAll('.job-listing__item');
    
        // Получаем выбранное условие фильтра
        const filterText = e.target.textContent.trim().toLowerCase();
        // Получаем выбранную категорию фильтра
        const filterCategory = e.target.dataset.role;
        const capitalizedFilterText = filterText.slice(0, 1).toUpperCase() + filterText.slice(1);
    
        // Проверяем, не был ли уже добавлен выбранный элемент в блок фильтров
        if (filterBlock.querySelector(`.btn-filter[data-filter="${filterText}"]`)) {
            return;
        }
    
        const filterItem = `
            <div class="filter-item">
                <div class="btn-filter" data-filter="${filterText}">${capitalizedFilterText}</div>
                <img class="delete-item" src="./assets/images/icon-remove.svg" alt="delete filter">
            </div>
        `;
        filterBlock.innerHTML += filterItem;

    
        // Добавляем класс к выбранным элементам, которые уже находятся в блоке фильтров
        const selectedItems = filterBlock.querySelectorAll('.btn-filter');
        listings.forEach(list => {
            const role = list.querySelector('.item-content__right-btn[data-role]').dataset.role;
            const level = list.querySelector('.item-content__right-btn[data-level]').textContent.trim().toLowerCase();
            const languages = Array.from(list.querySelectorAll('.item-content__right-btn[data-language]')).map(lang => lang.textContent.trim().toLowerCase());
            const tools = Array.from(list.querySelectorAll('.item-content__right-btn[data-tool]')).map(tool => tool.textContent.trim().toLowerCase());
    
            // Проверяем, соответствует ли элемент выбранному условию фильтра или его категории
            if (role === filterCategory || level === filterText || languages.includes(filterText) || tools.includes(filterText)) {
                list.style.display = 'flex';
                list.classList.add('active');
            } else {
                list.style.display = 'none';
            }

            filterWrapper.style.display = 'flex';
            
            selectedItems.forEach(item => {
                const itemText = item.dataset.filter;
                if (itemText === role || itemText === level || languages.includes(itemText) || tools.includes(itemText)) {
                    list.classList.add('selected');
                }
            });
        });
        
        
        
        const deleteItems = document.querySelectorAll('.delete-item');
        
        deleteItems.forEach(button => {
            button.addEventListener('click', (e) => {
                deleteFilter(e);
            });
        });

        clearAllItems.addEventListener('click', clearAllItemsFilter);

    }



    function deleteFilter(e) {
        const target = e.target;
        if (target.classList.contains('delete-item')) {
            const filterItem = target.closest('.filter-item');
            filterItem.remove();
        
            const selectedFilters = filterBlock.querySelectorAll('.btn-filter');
            if (selectedFilters.length < 1) {
            filterWrapper.style.display = 'none';
            }
        
            const listings = document.querySelectorAll('.job-listing__item');
            listings.forEach(list => {
            list.style.display = 'flex';
            list.classList.remove('selected');
            list.classList.remove('active');
            const languages = Array.from(list.querySelectorAll('.item-content__right-btn[data-language]')).map(lang => lang.textContent.trim().toLowerCase());
            const tools = Array.from(list.querySelectorAll('.item-content__right-btn[data-tool]')).map(tool => tool.textContent.trim().toLowerCase());
        
                selectedFilters.forEach(filter => {
                    const filterText = filter.dataset.filter;
                    const filterCategory = filter.dataset.role;
                    const level = filterText.toLowerCase();
                    if (filterCategory === 'role' && list.querySelector(`.item-content__right-btn[data-role="${filterText}"]`)) {
                        list.classList.add('selected');
                    }
                    if (filterCategory === 'level' && list.querySelector(`.item-content__right-btn[data-level="${level}"]`)) {
                        list.classList.add('selected');
                    }
                    if (languages.includes(filterText) || tools.includes(filterText)) {
                        list.classList.add('selected');
                    }
                });
            });
        }
    }



    window.onload = function () {
        const filters = document.getElementById('filter-wrapper');
        const filterItems = filters.querySelectorAll('.filter-item');
        if (filterItems.length === 0) {
            filters.style.display = 'none';
        }
    }


    function clearAllItemsFilter() {
        const listings = document.querySelectorAll('.job-listing__item');
        const filterItems = document.querySelectorAll('.filter-item');
        listings.forEach(list => {
            list.classList.remove('selected', 'active');
            list.style.display = 'flex';
        });
        filterItems.forEach(filterItem => filterItem.remove());
        filterWrapper.style.display = 'none';
    }

});