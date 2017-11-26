exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve, reject) => {
        if (jobs.length === 0) {
            resolve([]);
        }
        
        let result = []
        let lastJobIndex = parallelNum - 1;

        let jobsWithTimeouts = jobs.map(job =>{
            return {
                job: job,
                timeoutPromise: new Promise((reject) => {
                    setTimeout(reject, timeout, new Error(`Promise timeout`));
                })
            }
        })

        jobs.slice(0, parallelNum).forEach((_, index) => {
            startJob(index);
        });
        
        function startJob(jobIndex) {
            Promise.race([
                jobsWithTimeouts[jobIndex].job(),
                jobsWithTimeouts[jobIndex].timeoutPromise
            ])
                .then(jobResult => finishJob(jobResult, jobIndex));
        }

        function finishJob(jobResult, jobIndex) {
            result[jobIndex] = jobResult;
            if (lastJobIndex != jobs.length - 1){
                lastJobIndex++;
                startJob(lastJobIndex);
            }
            if (result.length == jobs.length) {
                resolve(result);
            }
        }
    })
}