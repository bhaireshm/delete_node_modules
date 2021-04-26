@ ECHO off

@REM Check if path exist
if EXIST "./node_modules" (

    @REM Loop in dir files
    for /f "delims=" %%f in ('dir /a /b /s %1') do (
        
        @REM Check file sizes
        for /f "usebackq delims=" %%s in ('%%f') do (

            @REM Check if there is a file bigger than 0 bytes
            if %%~zs GTR 0 (
                @REM The directory is not empty
                GOTO startApp
                EXIT /B 0
            )
        )
    )
    @REM The directory is empty
    CALL :installPackages
) else (
    @REM node_modules not found
    CALL :installPackages
)

:installPackages
ECHO Installing required packages please wait...
npm install && node app.js
EXIT 0

:startApp
node app.js