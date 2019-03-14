module.exports = [
    {
        title: '2 3 5 7的倍数',
        timeLimit: 1000,//ms
        memLimit: 131072,//kb
        origin: '李陶治',
        content: '给出一个数N，求1至N中，有多少个数不是2 3 5 7的倍数。 例如N = 10，只有1不是2 3 5 7的倍数。',
        inputDesc: '输入1个数N(1 <= N <= 10^18)。',
        outputDesc: '输出不是2 3 5 7的倍数的数共有多少。',
        sampleInput: '10',
        sampleOutput: '1',
        hint: '',
        test: [{input: '10', output: '1'}, {input: '100', output: '22'}, {input: '150', output: '34'}, {input: '200', output: '47'}, {input: '1000000000000000', output: '228571428571428'}]
    }
];
