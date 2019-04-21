const DAL = require('../DAL');
const config = require('../../config');

const businessesCollectionName = config.db.collections.businesses;
const usersCollectionName = config.db.collections.users;

module.exports = {
    GetBusinessByCode(businessCode) {
        return GetBusinessDetails({ "businessCode": parseInt(businessCode) });
    },

    SendWorkerRequest(worker, managerId, businessId) {
        return new Promise((resolve, reject) => {
            let managerFindObj = { "_id": DAL.GetObjectId(managerId) };
            let managerUpdateObj = { $push: { "requests": DAL.GetObjectId(worker.id) } }
            let workerFindObj = { "_id": DAL.GetObjectId(worker.id) };
            let workerUpdateObj = { $set: { "waitBusinessId": DAL.GetObjectId(businessId) } };

            let updateManager = DAL.UpdateOne(usersCollectionName, managerFindObj, managerUpdateObj);
            let updateWorker = DAL.UpdateOne(usersCollectionName, workerFindObj, workerUpdateObj);

            Promise.all([updateManager, updateWorker]).then(results => {
                resolve(results[1]);
            }).catch(reject);
        });
    },

    GetWaitBusinessDetails(businessId) {
        return GetBusinessDetails({ "_id": DAL.GetObjectId(businessId) });
    },

    AddWorkerToBusiness(businessId, userId, salary) {
        return new Promise((resolve, reject) => {
            DAL.UpdateOne(usersCollectionName, { userId: userId }, {
                $set: {
                    businessId: DAL.GetObjectId(businessId),
                    salary: salary
                },
                $unset: {
                    waitBusinessId: "",
                }
            })
            .then(user => {
                DAL.Update(usersCollectionName, {}, {
                    $pull: { requests: DAL.GetObjectId(user._id) }
                }).then(() => {
                    DAL.UpdateOne(businessesCollectionName, { _id: DAL.GetObjectId(businessId) }, {
                        $push: { workers: user._id }
                    }).then(business => resolve(business))
                        .catch(reject);
                })
                    .catch(reject);
            })
                .catch(reject);
        })
    },

    RemoveWorkerFromBusiness(businessId, userId) {
        return new Promise((resolve, reject) => {

            DAL.UpdateOne(usersCollectionName, { userId: userId }, {
                $unset: {
                    businessId: "",
                    salary: ""
                }
            }).then(user => {
                DAL.UpdateOne(businessesCollectionName, { _id: DAL.GetObjectId(businessId) }, {
                    $pull: { workers: DAL.GetObjectId(user._id) }
                }).then(business => resolve(business))
                    .catch(reject);
            })
                .catch(reject);
        })
    }
};

function GetBusinessDetails(queryObj) {
    return new Promise((resolve, reject) => {
        let fieldsName = {
            "name": 1,
            "address": 1,
            "manager": 1
        }

        DAL.FindOneSpecific(businessesCollectionName, queryObj, fieldsName).then(business => {
            if (business) {
                let managerId = DAL.GetObjectId(business.manager);
                let managerQueryObj = { _id: managerId };
                let managerQueryFields = { "firstName": 1, "lastName": 1 };
                DAL.FindOneSpecific(usersCollectionName, managerQueryObj, managerQueryFields).then(manager => {
                    business.manager = manager;
                    resolve(business);
                })
            }
            else {
                resolve(false)
            }
        }).catch(reject);
    });
}