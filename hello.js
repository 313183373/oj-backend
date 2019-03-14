const N = 4;
function drinkWater(n) {
    let result = 0;
    while(n >= N) {
        const bottles = Math.floor(n / N);
        result += bottles;
        n = n % N + bottles;
    }
    return n === (N -1) ? result + 1 : result;
}


console.log(drinkWater(14));