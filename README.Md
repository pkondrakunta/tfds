**THANOS DESKTOP APPLICATION**

**Thanos File Deployment Service**

The previous commit(1) implements:

1. Setting password for newly registered users.
2. Online authentication for a new/returning user on the device.
3. Offline authentication for a returning user on the device.
4. Scanning of connected Network and drones on that network.
5. Authorization of drones registered to a user, i.e. each user can connect to only registered drones (have to be updated to the database by Thanos).
6. Functionality UI for connected drones.
7. ssh connection to the raspberry pi on the drone and run associated programs.

The previous commit(2) implements:

1. Send PA - Added alert if same name file exists. Also executes deletePA.py before replacing the file.
2. access.js - Added comments
3. Download Logs - Changed to list sub directories
4. Clear Logs Added - Home screen now includes a seperate button
5. Upload DGCA Certificate Added - Home screen now includes a seperate button
6. Distributable .dmg and .zip have been extracted for MacOS. Can be found in "dist" folder
7. Verify PA - Added file fetch and select. Executes validatePA.py
8. The Firebase authentication has been updated to the account 'thanos.firebase@gmail.com'. The database and complete user details will be linked to that account.
9. Seperate folders have been created for MacOS and Windows.
10. Build instructions added.

The previous commit(3)implements:
1. Changed login logic to update local data everytime the user does online login.
2. Fixed download logs bug.
3. Fixed bug in IP scanning and added advanced search feature.
4. Added spinning-loader to generate key button.
5. Get public key will now only extract .pem file from given path.
6. Paths modified as per NPNT requirements.

The current commit implements:
1. Added forgot password feature
    *   Random Temporary Password generated
    *   SendGrid has been integrated to send the temporary password in email 
    *   UI and functionality have been updated to accomodate this feature.
2. Updated signup to work with a temporary password
3. Created dropdowns in place in lists in extract PA, Delete PA and Downloads logs
4. Updated Send PA file to accept only .xml and .zip files
5. Icons renamed and removed Menubar

**NOTE:**
* You can change the ```SECRET_KEY``` for local encryption on line 4 of ```index.js```
* Random password is generated on line 55 of ```forgot_password.js``` for Password Reset
* Random password is generated on line 55 of ```index.js``` for SignUp


**BUILDING THE APPLICATION**

You can clone the GitHub repository and build the app by following this process. These steps may differ in the future depending on version changes in electron and electron-builder.

1. Clone the GitHub repo
    ```
    git clone https://github.com/anuroopshannu/TFDS-Main.git
    ```
2. In the terminal, ```cd``` into the Mac/Windows version of the repo and run:
   ```
   npm install
   ```
3. After node installation, run:
   ```
   npm rebuild --runtime=electron --target=7.0.0
   ```
4. To build the app, we will install electron-builder:
   ```
   npm install -g electron-builder
   ```
5. Once installed, run this command to extract the installers (you can extract both .exe and .dmg files in this step):
   ```
   npm run dist
   ```

    **Note:**

    - After Step 3, you can test (for development purposes only) the app by running the command: 
    ```
    npm start
    ```
    - The app files will be created in the "dist" folder of the project.
    - You change the product name and description for the app in the "package.json" file. All the requirements for the app have already been included in Dependencies of this JSON and will be packaged into app when you run "npm run dist".
    - To change the app icon, replace the image in the build folder. However, ensure that the new icon is named as "icon.icns"

**CHANGING THE BANNER ON RASPBERRY PI**

For each Raspberry Pi, you can change the name appearing on SSH to a unique_thanos_id.

1. On Raspberry Pi terminal change the directory:
    ```
    sudo nano /etc/ssh/sshd_config
    ```
2. In the sshd_config file you will have to update the following fields:
    ```
    DebianBanner no
    VersionAddendum unique_thanos_id
    ```

**HANDLING THE DATABASE**

Log into the database account(thanos.firebase@gmail.com) on https://firebase.google.com
Go to the console and open the database.

**Adding users:**
1. To add users, click on "Add document".
2. A dialog will appear and the ID can be automatically generated.
3. The first field should be entered as ```username```, Type ```string``` and fill the registered email ID in the field value.
4. Add a new field by clicking on +
5. The next field should be added as ```pwd```, Type ```string``` and should be left blank for the user to set his password.
6. The next field should be added as ```rpiun```, Type ```array``` and add the corresponding unique_thanos_id for every drone owned by this user.
7. Final field should be added as ```rpipwd```, Type ```string``` and fill the value as ```thanos_master```
8. Click on "Save" to add the user to the database.

You can always update user data by changing the field values. Do not change the field names and field types. 