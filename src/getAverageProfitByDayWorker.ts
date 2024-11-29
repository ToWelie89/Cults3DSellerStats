import moment from "moment";
import ISale from "./interfaces/ISale";

self.onmessage = function (e) {
    if (e.data.msg === 'initAverageCount' && e.data.sales) {
        const sales : ISale[] = e.data.sales;
    
        const firstSale = sales.sort((a, b) => Number(moment(a.createdAt).format('x')) - Number(moment(b.createdAt).format('x')))[0];

        const startDate = moment(firstSale.createdAt);
    
        const dailySales = [];
    
        let currentDate = startDate.clone();
        while (currentDate.format('DD-MM-YYYY') !== moment().add(1, 'days').format('DD-MM-YYYY')) {
            const salesThisDay = sales.filter(x => moment(x.createdAt).format('DD-MM-YYYY') === currentDate.format('DD-MM-YYYY'));
    
            dailySales.push(salesThisDay.reduce((t, c) => t += (c.income.cents / 100), 0));
    
            currentDate.add(1, 'days');
        }
        const totalIncomeForAllTime = dailySales.reduce((t, c) => t += c, 0);
    
        const averageProfitPerDay = totalIncomeForAllTime / dailySales.length;
    
        postMessage({
            status: 'success',
            avgPerDay: averageProfitPerDay
        });
    }
};