export const round = (x: number) => {
    let res = x;
    res = res * 100;
    res = Math.round(res);
    res = res / 100;

    if (
        (res + '').split('.')[1] &&
        (res + '').split('.')[1].length === 1
    ) {
        return (res + '0');
    } else if (!(res + '').includes('.')) {
        return (res + '.00');
    } else {
        return res;
    }
}