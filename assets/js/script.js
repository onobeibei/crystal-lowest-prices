function refreshPage() {
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const apiBase = "https://api-market.genso.game/api/market/consumption";
    const searchParams = [
        "20000000165",
        "20000000169",
        "20000000170",
        "20000000162",
        "20000000166",
        "20000000167",
        "20000000164",
        "20000000161",
        "20000000168"
    ];

    const clearGrid = () => {
        const crystalGrid = document.getElementById('crystalGrid');
        crystalGrid.innerHTML = '';
    };

    const createGridItem = (item) => {
        const unitPriceType = item.currentCurrency === 'USDT' ? 'USDT' : 'MV';
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        const itemLink = document.createElement('a');
        itemLink.href = `https://market.genso.game/marketplace/consumption-items?nftId=${item.nftItemId}`;
        itemLink.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-content">
                <h3>${item.name}</h3>
                <div class="price-tag">
                    <span class="${unitPriceType.toLowerCase()}">${unitPriceType}</span>
                    <span class="price-number">${unitPriceType === 'USDT' ? item.currentUnitPrice : item.mvPrice}</span>
                </div>
                <div class="quantity">x${item.quantity}</div>
            </div>
        `;
        const itemIdContainer = document.createElement('div');
        itemIdContainer.className = 'item-id';
        itemIdContainer.textContent = `#${item.consumptionId}`;
        itemLink.prepend(itemIdContainer);
        gridItem.appendChild(itemLink);
        return gridItem;
    };

    const fetchData = async () => {
        try {
            clearGrid();
            const responses = await Promise.all(searchParams.map(param =>
                fetch(`${apiBase}?page=1&itemType=consumption_item&rarity=&sort=lowest&search=${param}`)
                    .then(response => response.json())
            ));

            const items = responses
                .filter(data => data.sellingOrders && data.sellingOrders.length > 0)
                .map(data => data.sellingOrders[0])
                .sort((a, b) => b.currentUnitPrice - a.currentUnitPrice);

            const crystalGrid = document.getElementById('crystalGrid');
            items.forEach(item => {
                const gridItem = createGridItem(item);
                crystalGrid.appendChild(gridItem);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
});
