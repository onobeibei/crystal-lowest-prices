// 定义刷新页面的函数
function refreshPage() {
    // 清除浏览器缓存并重新加载页面
    location.reload(true);
}

// 当DOM内容加载完成时执行
document.addEventListener('DOMContentLoaded', async () => {
    // API基础URL
    const apiBase = "https://api-market.genso.game/api/market/consumption";
    // 搜索参数列表
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

    // 清空网格内容的函数
    const clearGrid = () => {
        // 获取网格容器元素
        const crystalGrid = document.getElementById('crystalGrid');
        // 清空网格容器的HTML内容
        crystalGrid.innerHTML = '';
    };

    // 创建网格项的函数
    const createGridItem = (item, latestPrice) => {
        // 根据当前货币单位确定价格类型
        const unitPriceType = item.currentCurrency === 'USDT' ? 'USDT' : 'MV';
        // 创建网格项的外层div元素
        const gridItem = document.createElement('div');
        // 设置网格项的类名
        gridItem.className = 'grid-item';
        // 创建包含物品链接的<a>元素
        const itemLink = document.createElement('a');
        // 设置物品链接的href属性
        itemLink.href = `https://market.genso.game/marketplace/consumption-items?nftId=${item.nftItemId}`;
        // 设置物品链接的HTML内容，包括图片、名称、价格和数量信息
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
        // 创建包含物品ID的<div>元素
        const itemIdContainer = document.createElement('div');
        // 设置物品ID容器的类名
        itemIdContainer.className = 'item-id';
        // 设置物品ID容器的文本内容为物品ID
        itemIdContainer.textContent = `#${item.consumptionId}`;
        // 将物品ID容器插入到物品链接的最前面
        itemLink.prepend(itemIdContainer);
        // 将物品链接添加到网格项中
        gridItem.appendChild(itemLink);
        // 返回创建好的网格项
        return gridItem;
    };

    // 获取最新成交价的函数
    const fetchLatestPrice = async (nftId) => {
        try {
            // 发送获取最新成交价的请求
            const response = await fetch(`https://api-market.genso.game/api/market/erc1155/consumptions/transactionLogs?page=1&userAddress=&itemType=consumption_item&days=180&search=${nftId}`);
            // 解析响应为JSON格式
            const data = await response.json();
            // 获取第一项元素作为最新成交价
            const latestPrice = data.transactionLogs[0];
            // 返回最新成交价对象
            return latestPrice;
        } catch (error) {
            // 捕获并打印错误信息
            console.error('Error occurred while fetching the latest traded price:', error);
            // 返回空对象
            return {};
        }
    };

    try {
        // 清空网格内容
        clearGrid();
        // 并行获取每个搜索参数的数据和最新成交价
        const responses = await Promise.all(searchParams.map(async param => {
            // 获取物品数据
            const itemResponse = await fetch(`${apiBase}?page=1&itemType=consumption_item&rarity=&sort=lowest&search=${param}`);
            const itemData = await itemResponse.json();
            // 获取最新成交价数据
            const latestPrice = await fetchLatestPrice(param);
            // 返回物品数据和最新成交价数据
            return { itemData, latestPrice };
        }));

        // 过滤有效数据，并按照当前价格降序排序
        const items = responses
            .filter(data => data.itemData.sellingOrders && data.itemData.sellingOrders.length > 0)
            .map(data => {
                const item = data.itemData.sellingOrders[0];
                const latestPrice = data.latestPrice;
                return { item, latestPrice };
            })
            .sort((a, b) => b.item.currentUnitPrice - a.item.currentUnitPrice);

        // 获取网格容器
        const crystalGrid = document.getElementById('crystalGrid');
        // 遍历每个物品，并创建相应的网格项
        items.forEach(item => {
            const gridItem = createGridItem(item.item, item.latestPrice);
            crystalGrid.appendChild(gridItem);
        });
    } catch (error) {
        // 捕获并打印错误信息
        console.error('Error occurred while fetching data:', error);
    }
});