import { GetMap } from './map.js';
import { GetCityLayer, GetCityNames } from './cityLayer.js';
import { makeDraggableControl } from "./utility.js";

export function AddCitySearchControl() {

    const map = GetMap();
    if (!map) return;

    const cityLayer = GetCityLayer();
    if (!cityLayer) return;

    const SearchControl = L.Control.extend({
        options: { position: 'topright' },

        onAdd: function () {

            const div = L.DomUtil.create('div', 'city-search');

            div.innerHTML = `
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Şehir ara..." autocomplete="off" />
                </div>
                <div class="autocomplete-list"></div>
            `;

            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            const input = div.querySelector('input');
            const list = div.querySelector('.autocomplete-list');

            let selectedIndex = -1;

            function showSuggestions(value) {

                list.innerHTML = '';
                selectedIndex = -1;

                const cityNames = GetCityNames();

                if (!value || !cityNames || cityNames.length === 0) {
                    list.style.display = 'none';
                    return;
                }

                const matches = cityNames
                    .filter(c => c.toLowerCase().includes(value.toLowerCase()))
                    .slice(0, 6);

                if (matches.length === 0) {
                    list.style.display = 'none';
                    return;
                }

                matches.forEach((name) => {

                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = name;

                    item.onclick = () => {
                        input.value = name;
                        list.style.display = 'none';
                        searchCity(name);
                    };

                    list.appendChild(item);
                });

                list.style.display = 'block';
            }

            function searchCity(cityName) {

                let found = false;

                cityLayer.eachLayer(layer => {
                    if (layer.feature.properties.name === cityName) {
                        const center = layer.getBounds().getCenter();
                        map.flyTo(center, 8, { duration: 1.2 });
                        layer.fire('click');
                        found = true;
                    }
                });

                if (!found) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Şehir Bulunamadı',
                        text: 'Geçerli bir şehir seç.',
                        confirmButtonColor: '#1e88e5'
                    });
                }
            }

            function updateSelection(items) {

                items.forEach((item, index) => {
                    item.classList.remove('active');

                    if (index === selectedIndex) {
                        item.classList.add('active');

                        item.scrollIntoView({
                            block: "nearest"
                        });
                    }
                });
            }

            function handleKeyDown(e) {

                const items = list.querySelectorAll('.autocomplete-item');

                if (list.style.display === 'none' || items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % items.length;
                    updateSelection(items);
                }

                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                    updateSelection(items);
                }

                else if (e.key === 'Enter') {
                    e.preventDefault();

                    if (selectedIndex >= 0) {
                        items[selectedIndex].click();
                    } else {
                        searchCity(input.value);
                    }

                    list.style.display = 'none';
                }
            }

            input.addEventListener('input', e => showSuggestions(e.target.value));
            input.addEventListener('keydown', handleKeyDown);

            document.addEventListener('click', () => {
                list.style.display = 'none';
            });

            makeDraggableControl(div);

            return div;
        }
    });

    map.addControl(new SearchControl());
}