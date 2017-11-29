'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        if (jobs.length === 0) {
            resolve([]);

            return;
        }

        let result = [];
        let lastJobIndex = parallelNum - 1;

        let jobsWithTimeouts = jobs.map(job => {
            return {
                jobPromise: job,
                timeoutPromise: new Promise((timeoutResolve, timeoutReject) => {
                    setTimeout(timeoutReject, timeout, new Error('Promise timeout'));
                })
            };
        });

        for (let index = 0; index < parallelNum; index++) {
            startJob(index);
        }

        function startJob(jobIndex) {
            Promise.race([
                jobsWithTimeouts[jobIndex].jobPromise(),
                jobsWithTimeouts[jobIndex].timeoutPromise
            ])
                .then(jobResult => finishJob(jobResult, jobIndex))
                .catch(jobResult => finishJob(jobResult, jobIndex));
        }

        function finishJob(jobResult, jobIndex) {
            result[jobIndex] = jobResult;
            if (lastJobIndex !== jobs.length - 1) {
                lastJobIndex++;
                startJob(lastJobIndex);
            }
            if (result.length === jobs.length) {
                resolve(result);
            }
        }
    });
}
