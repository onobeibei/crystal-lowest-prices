// 定义刷新页面的函数
function refreshPage() {
    // 清除浏览器缓存并重新加载页面
    location.reload(true);
}

document.addEventListener('DOMContentLoaded', async () => {
    // API基础路径
    const apiBase = "https://api-market.genso.game/api/market/consumption";
    // 搜索参数
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
    // 溶剂ID
    const mysticalSolventId = "20000000160";

    // 清空网格
    const clearGrid = () => {
        const crystalGrid = document.getElementById('crystalGrid');
        crystalGrid.innerHTML = '';
    };

    // 创建网格项
    const createGridItem = (item, latestPrice) => {
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
                <div class="latest-traded-price">LTP: ${latestPrice.currencyCode} ${latestPrice.floatUnitPrice} (x${latestPrice.quantity})</div>
            </div>
        `;
        const itemIdContainer = document.createElement('div');
        itemIdContainer.className = 'item-id';
        itemIdContainer.textContent = `#${item.consumptionId}`;
        itemLink.prepend(itemIdContainer);
        gridItem.appendChild(itemLink);
        return gridItem;
    };

    // 获取最新成交价
    const fetchLatestPrice = async (nftId) => {
        try {
            const response = await fetch(`https://api-market.genso.game/api/market/erc1155/consumptions/transactionLogs?page=1&userAddress=&itemType=consumption_item&days=180&search=${nftId}`);
            const data = await response.json();
            const latestPrice = data.transactionLogs[0];
            return latestPrice;
        } catch (error) {
            console.error('获取最新成交价时发生错误:', error);
            return {};
        }
    };

    try {
        // 显示加载消息
        document.getElementById('loadingMessage').style.display = 'block';

        clearGrid();
        const responses = await Promise.all(searchParams.map(async param => {
            const itemResponse = await fetch(`${apiBase}?page=1&itemType=consumption_item&rarity=&sort=lowest&search=${param}`);
            const itemData = await itemResponse.json();
            const latestPrice = await fetchLatestPrice(param);
            return { itemData, latestPrice };
        }));

        // 筛选有效数据并排序
        const items = responses
            .filter(data => data.itemData.sellingOrders && data.itemData.sellingOrders.length > 0)
            .map(data => {
                const item = data.itemData.sellingOrders[0];
                const latestPrice = data.latestPrice;
                return { item, latestPrice };
            })
            .sort((a, b) => b.item.currentUnitPrice - a.item.currentUnitPrice);

        // 获取溶剂数据
        const specialCrystalResponse = await fetch(`${apiBase}?page=1&itemType=consumption_item&rarity=&sort=lowest&search=${mysticalSolventId}`);
        const specialCrystalData = await specialCrystalResponse.json();
        const specialCrystalLatestPrice = await fetchLatestPrice(mysticalSolventId);

        // 将溶剂数据添加到列表中
        items.push({ item: specialCrystalData.sellingOrders[0], latestPrice: specialCrystalLatestPrice });

        // 获取网格容器
        const crystalGrid = document.getElementById('crystalGrid');
        // 为每个水晶创建网格项并添加到容器中
        items.forEach(item => {
            const gridItem = createGridItem(item.item, item.latestPrice);
            crystalGrid.appendChild(gridItem);
        });

        // 加载完成后隐藏加载消息
        document.getElementById('loadingMessage').style.display = 'none';
    } catch (error) {
        console.error('获取数据时发生错误:', error);
        // 隐藏加载消息
        document.getElementById('loadingMessage').style.display = 'none';
    }
});
