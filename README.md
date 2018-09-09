## host 命令行管理工具
> switch and manage your hosts easily~
![](./screenshots/show.gif)
### 展现所有的hosts配置
```
host-switch list
```
### 添加新的host
host-switch add host ip
![](./screenshots/add.gif)
```
//  If ignore ip,  127.0.0.1 will be used  by default

// add `127.0.0.1 test.com` to hosts
sudo host-switch add test.com
// add `182.8.91.1 aaa.com` to hosts
sudo host-switch add aaa.com 182.8.91.1
```
> TIPS: 
  1. why need sudo ?
  Beacause maybe you don't have the  permission of wriable for the hosts file.
  2. hate input pwd?
  ```
  // after the fllowing command, you will never need input pwd agian!
  sudo host-switch no-pwd
  ```
### 删除指定host
sudo host-switch remove host_name
```
  // will remove all the items maped the host_name
  sudo host-switch remove aaa.com
```
### 禁用指定host
sudo host-switch disable host_name
```
  // will diabled all the items maped the host_name
  sudo host-switch diable aaa.com
```
### 启动指定host
sudo host-switch enable host_name
```
  // will enable all the items maped the host_name
  sudo host-switch enable aaa.com
```
### 关于执行没有权限报错处理
1. 使用sudo
2. 添加可写权限
```
//use host-switch command
sudo host-switch no-pwd
// linux or mac
sudo chmod 666 /etc/hosts
```



