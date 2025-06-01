import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useDeviceStore } from '@/stores/deviceStore';

class ApiRepository {
  constructor() {
    // ایجاد axios instance
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // تنظیم interceptors
    this._setupInterceptors();
  }

  _setupInterceptors() {
    // افزودن توکن به هدر درخواست‌ها
    this.http.interceptors.request.use((config) => {
      const userStore = useUserStore();
      const deviceStore = useDeviceStore();

      // اگر config.data وجود دارد و FormData نیست، آن را تبدیل می‌کنیم
      if (config.data && !(config.data instanceof FormData)) {
        const formData = new FormData();
        for (const key in config.data) {
          formData.append(key, config.data[key]);
        }
        config.data = formData;
      }

      // اضافه کردن توکن و آیدی کاربر به فرم دیتا
      if (userStore.token || userStore.userId) {
        const formData = config.data || new FormData();

        if (userStore.token) {
          formData.append('uToken', userStore.token);
        }

        if (userStore.userId) {
          formData.append('uID', userStore.userId);
        }

        if (deviceStore.deviceInfo) {
          formData.append('deviceInfo', deviceStore.deviceInfo);
        }

        config.data = formData;
      }

      return config;
    });

    // مدیریت خطاها
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const userStore = useUserStore();
          userStore.logout();
        }
        return Promise.reject(error);
      },
    );
  }

  setOnlineState(data = {}) {
    return this.http.post('onlineState/set.php', data);
  }
  // trade page
  getPriceList(data = {}) {
    return this.http.post('prices/list.php', data);
  }

  getTotalSummary(data = {}) {
    return this.http.post('balance/totalSummary.php', data);
  }

  updatePrice(data = {}) {
    return this.http.post('prices/update.php', data);
  }

  getAdminMessage(data = {}) {
    return this.http.post('adminMessage/get.php', data);
  }

  setAdminMessage(data = {}) {
    return this.http.post('adminMessage/set.php', data);
  }

  //manual-document
  getUserList(data = {}) {
    return this.http.post('users/list.php', data);
  }

  updateUserStatus(data = {}) {
    return this.http.post('users/updateActive.php', data);
  }

  getUserPricesList(data = {}) {
    return this.http.post('userPrices/list.php', data);
  }

  addOrder(data = {}) {
    return this.http.post('requests/add.php', data);
  }

  //balance-report
  getMainBalance(data = {}) {
    return this.http.post('balance/mainBalance.php', data);
  }

  setSetting(data = {}) {
    return this.http.post('settings/set.php', data);
  }

  updateBalanceCredential(data = {}) {
    return this.http.post('prices/updateBalanceCredential.php', data);
  }

  // add Item
  addItem(data = {}) {
    return this.http.post('prices/add.php', data);
  }

  //list

  updateItemStatus(data = {}) {
    return this.http.post('prices/updateActive.php', data);
  }

  updateItemBuySell(data = {}) {
    return this.http.post('prices/updateBuySell.php', data);
  }

  updateItemSorting(data = {}) {
    return this.http.post('prices/updateSorting.php', data);
  }

  //journal
  getTotalSummaryReport(data = {}) {
    return this.http.post('balance/totalSummaryReport.php', data);
  }

  getDataSummaryReport(data = {}) {
    return this.http.post('requests/dateSummary.php', data);
  }

  getRequestList(data = {}, states = '3,4') {
    const fixDate = {
      sort: 'id DESC',
      states: states,
      ...data,
    };
    return this.http.post('requests/list.php', fixDate);
  }

  getDeletedRequestsList(data = {}) {
    const fixDate = {
      sort: 'id DESC',
      states: '3,4',
      ...data,
    };
    return this.http.post('deletedRequests/list.php', fixDate);
  }

  deleteRequestItem(data = {}) {
    return this.http.post('requests/delete.php', data);
  }

  editRequestItem(data = {}) {
    return this.http.post('editedRequests/add.php', data);
  }

  updateIsPrinted(data = {}) {
    return this.http.post('requests/updateIsPrinted.php', data);
  }

  getRequestCount(data = {}) {
    return this.http.post('requests/requestCount.php', data);
  }

  getUserGroupList(data = {}) {
    return this.http.post('userGroup/list.php', data);
  }

  addUserGroup(data = {}) {
    return this.http.post('userGroup/add.php', data);
  }

  editUserGroupItem(data = {}) {
    return this.http.post('userGroup/edit.php', data);
  }

  getAttachmentsGroupList(data = {}) {
    return this.http.post('attachments/groupList.php', data);
  }

  addAttachments(data = {}) {
    return this.http.post('attachments/add.php', data);
  }

  getAttachmentsList(data = {}) {
    return this.http.post('attachments/list.php', data);
  }

  checkImage(data = {}) {
    return this.http.post('attachments/updateIsChecked.php', data);
  }

  sendSms(data = {}) {
    return this.http.post('crm/SendSingleSms.php', data);
  }

  getTransactionsGroupList(data = {}) {
    return this.http.post('havale/groupList.php', data);
  }

  getTransactionsList(data = {}) {
    return this.http.post('havale/list.php', data);
  }

  checkUserPass(data = {}) {
    return this.http.post('users/checkUserPass.php', data);
  }

  addUser(data = {}) {
    return this.http.post('users/signup.php', data);
  }

  requestDateSummary(data = {}) {
    return this.http.post('requests/dateSummary.php', data);
  }

  getCustomerList(data = {}) {
    const payload = {
      sort: 'sortState DESC,id DESC',
      ...data,
    };
    return this.http.post('requests/list.php', payload);
  }

  getAllUsersData(data = {}) {
    return this.http.post('users/allUsers.php', data);
  }

  getPendingUsers(data = {}) {
    return this.http.post('authentication/pending.php', data);
  }

  addAuthentication(data = {}) {
    return this.http.post('authentication/add.php', data);
  }

  updateAuthenticationStatus(data = {}) {
    return this.http.post('authentication/updateStatus.php', data);
  }

  getAuthenticationStatus(data = {}) {
    return this.http.post('authentication/isRequested.php', data);
  }

  getUsersInfo(data = {}) {
    return this.http.post('users/info.php', data);
  }

  getAllPriceLogView(data = {}){
    return this.http.post('priceLogView/getAll.php', data)
  }


  deleteToken(data = {}) {
    return this.http.post('tokens/delete.php', data);
  }

  addLoginLog(data = {}) {
    return this.http.post('loginLog/allowUserLogin.php', data);
  }

  setAllItemsAccountId(data = {}) {
    return this.http.post('userPrices/setAllItemsAccountId.php', data);
  }

  getUsersStatistics(data = {}){
    return this.http.post('statistics/usersStatistics.php', data)
  }

  userGroupData(data = {}){
    return this.http.post('userPrices/userGroupData.php' , data)
  }

  updateUserPrices(data = {}){
    return this.http.post('userPrices/update.php' , data)
  }

  remainedConfirmation(data = {}){
    return this.http.post('remainedConfirmation/isAllowed.php' , data)
  }

  updateRemainedConfirmation(data = {}){
    return this.http.post('remainedConfirmation/updateAnswer.php' , data)
  }

  getAdminState(data = {}){
    return this.http.post('onlineState/adminState.php' , data)
  }

  getSettings(data = {}){
    return this.http.post('settings/get.php', data)
  }

  crmStartSms(data = {}){
    return this.http.post('crm/sendApplicationStartSms.php' ,data)
  }

  crmCloseSms(data = {}){
    return this.http.post('crm/sendApplicationCloseSms.php', data)
  }

  crmBestPriceSms(data = {}){
    return this.http.post('crm/sendApplicationBestPrice.php', data)
  }

  updateTerms(data = {}){
    return this.http.post('terms/update.php' , data)
  }

  addHavale(data = {}){
    return this.http.post('havale/add.php', data)
  }

  getHavaleList(data = {}){
    return this.http.post('havale/list.php', data)
  }

  getCustomerRequestList(data = {}) {
    return this.http.post('requests/list.php', data);
  }

  updateIsSeen(data = {}){
    return this.http.post('requests/updateIsSeen.php', data)
  }

  getAboutUs(data = {}){
    return this.http.post('aboutus/get.php', data)
  }

  updateGroupItems(data = {}){
    return this.http.post('userPrices/updateByGroupId.php', data)
  }

  getOnlineState(data = {}){
    return this.http.post('onlineState/list.php', data)
  }

  getRequestLog(data={}){
    return this.http.post('requests/log.php', data)
  }

  getIsDuplicated(data={}){
    return this.http.post('requests/isDuplicated.php', data)
  }

  getOrderState(data={}){
    return this.http.post('requests/state.php', data)
  }

  updateIsConfirmed(data={}){
    return this.http.post('requests/updateIsConfirmed.php', data)
  }

  checkBackupPass(data ={}){
    return this.http.post('users/pass.php', data)
  }

  getPendingRequests(data={}){
    return this.http.post('requests/pendingRequests.php', data)
  }

  updateState(data={}){
    return this.http.post('requests/updateState.php', data)
  }

  resetPriceGroup(data={}){
    return this.http.post('userPrices/resetByGroupId.php', data)
  }

  getTotalSummaryDetail(data={}){
    return this.http.post('balance/totalSummaryDetail.php', data)
  }

  updateUserPassword(data={}){
    return this.http.post('users/changeUserPass.php', data)
  }
}

const repository = new ApiRepository();

export default repository;
