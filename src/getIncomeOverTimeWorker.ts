import moment from "moment";
import ISale from "./interfaces/ISale";

self.onmessage = function (e) {
    if (e.data.msg === 'initProfitOverTime' && e.data.sales) {
        let sales: ISale[] = e.data.sales;

        sales = sales.sort(
            (a, b) =>
                Number(moment(a.createdAt).format('x')) - Number(moment(b.createdAt).format('x'))
        );

        const firstSale = sales[0];
        const startDate = moment(firstSale.createdAt);
        let currentDate = startDate.clone();

        let res = [];
        console.log('start getting total profit over time')

        while (currentDate.format('DD-MM-YYYY') !== moment().add(1, 'days').format('DD-MM-YYYY')) { // Loop until today

            const salesThisDay = sales.filter(x => moment(x.createdAt).format('DD-MM-YYYY') === currentDate.format('DD-MM-YYYY'));

            const totalProfitMadeThisDay = salesThisDay.length > 0
                                                ? salesThisDay.reduce((t, c) => t += (c.income.cents / 100), 0)
                                                : 0;

            const totalMoneyMadeSoFar : number = res.length > 0
                                                    ? (res[res.length - 1] as any).moneyMadeSoFar
                                                    : 0;

            res.push({
                currentDate: currentDate.format('DD-MM-YYYY'),
                moneyMadeSoFar: totalMoneyMadeSoFar + totalProfitMadeThisDay
            });

            currentDate.add(1, 'days');
        }

        postMessage({
            status: 'success',
            profitOverTime: res
        });
    }
};