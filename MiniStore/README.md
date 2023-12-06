
# Spring Boot with JDK 11 Installation Guide

This readme provides a step-by-step guide to help you set up and run a Spring Boot project with JDK 11 after downloading it from GitHub. The instructions assume that you have basic knowledge of Java, Git, and using the command line interface.

## Prerequisites

Before you begin, ensure you have the following prerequisites installed on your system:

1. **JDK 11**: Download and install JDK 11 (Java Development Kit) from the official Oracle website or adopt OpenJDK distribution.

2. **Git**: Install Git on your machine. You can download Git from the official website: https://git-scm.com/downloads

3. **Integrated Development Environment (IDE)**: You will need an IDE to work with the Spring Boot project. We recommend using IntelliJ IDEA, Eclipse, or Visual Studio Code.

## Installation Steps

Follow the steps below to set up the Spring Boot project with JDK 11:

### 1. Clone the GitHub Repository

Open a terminal or command prompt, navigate to the directory where you want to store the project, and run the following command:

```bash
git clone https://github.com/HieuNghia0000/SWP-Team-3.git
```

### 2. Import Project into IDE

Open your chosen IDE (IntelliJ IDEA, Eclipse, or Visual Studio Code), and import the cloned project:

- **IntelliJ IDEA**: 
  - Select "Import Project."
  - Browse to the project's root directory and select the `pom.xml` file.
  - Click "Open" and select "Import project from external model" -> "Maven."

- **Eclipse**:
  - Select "File" -> "Import."
  - Choose "Existing Maven Projects."
  - Browse to the project's root directory and click "Finish."

- **Visual Studio Code**:
  - Open the project folder directly.
  - Ensure you have the Java Extension Pack installed to support Java development.

### 3. Set JDK 11 as the Project SDK

In your IDE, ensure that JDK 11 is used as the project SDK. If JDK 11 is not automatically detected, you might need to configure it manually:

- **IntelliJ IDEA**:
  - Go to "File" -> "Project Structure."
  - Under "SDKs," click the "+" button to add a new SDK.
  - Select the path to your JDK 11 installation directory.

- **Eclipse**:
  - Go to "Window" -> "Preferences."
  - In the Preferences window, navigate to "Java" -> "Installed JREs."
  - If JDK 11 is not listed, click the "Add" button and provide the path to your JDK 11 installation.

### 4. Build the Project

Once the project is imported and JDK 11 is set as the project SDK, it's time to build the project. Run the following Maven command in the terminal or your IDE's Maven tool window:

```bash
./mvnw clean package
```

This will build the Spring Boot project and create an executable JAR file.

### 5. Run the Application

To run the Spring Boot application, use the following command:

```bash
./mvnw spring-boot:run
```

After the application starts, you should see the logs indicating that the application is running.

### 6. Access the Application

Open a web browser and navigate to `http://localhost:8080` (assuming the application is running on the default port 8080). You should see the application's home page or an API response if it's a RESTful API project.

Congratulations! You have successfully set up and run the Spring Boot project with JDK 11.

## Additional Notes

- If you encounter any issues during the setup process, check the project's documentation or GitHub repository for specific troubleshooting steps.

- Make sure you have a working internet connection during the initial setup, as Maven will automatically download any required dependencies.

- If you want to build a production-ready JAR that can be deployed independently, use the `./mvnw clean package -Pprod` command instead of just `./mvnw clean package`.

- Remember to check for any environment-specific configuration, such as database connection details, application properties, etc., that might require customization.


