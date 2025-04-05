# Introduction
In this project, we developed an interface featuring various visualization tools to address the VAST Challenge 2024 MC-2 tasks. Together with my colleagues, we aimed to detect the behavior of different types of vessels and identify illegal fishing activities, such as those tied to SouthSeafood Express Corp. The interface allows users to explore and analyze vessel data, facilitating the detection of suspicious activities in maritime environments. For further information, please check the [`"Paper"`](https://github.com/esahin99/FishEye-VAST-Challenge-2024-Mini-Challenge-2/blob/main/Vast%20Challenge%202024%20MC2-1.pdf) and [`"Presentation"`](https://github.com/esahin99/FishEye-VAST-Challenge-2024-Mini-Challenge-2/blob/main/Ava2024.pptx) in the repo. Also, you can visit and watch the [`"Video"`](https://youtu.be/fcC51HO8uOI) to get information about the tool. If you want to look at the tasks of the challenge, you can visit [`"here"`](https://vast-challenge.github.io/2024/MC2.html). To see the project paper click on [`"Paper"`](https://ieeexplore.ieee.org/document/10750084)

# Visualizations
The interface includes five different graphs to visualize vessel behavior:
- Heatmap: Displays areas with high vessel activity, making it easy to spot patterns.
- Line Chart: Tracks vessel movements and activity over time.
- Pixel Graph: Offers detailed, granular visualizations of vessel behavior.
- Network Graph (2 types): Shows relationships and interactions between vessels to help identify potential illegal networks.

# Technologies Used
The project leverages a combination of modern technologies and programming languages:
- Docker: Containerization for consistent environments.
- PostgreSQL: Database management system to store and manage data.
- Python: Backend programming for data processing and analysis.
- JavaScript: Used for dynamic and interactive visualizations.
- HTML & CSS: Structure and styling for the user interface.

## Getting Started
Follow these steps to set up and run the project locally:
1- Clone the repository:
```sh
 git clone [https://github.com/yourusername/yourproject.git](https://github.com/esahin99/FishEye-VAST-Challenge-2024-Mini-Challenge-2.git)
```
2- Navigate to the project directory:
```sh
 cd FishEye-VAST-Challenge-2024-Mini-Challenge-2
```
3- Build Docker:
```sh
 docker-compose build
```
3- Run the project using Docker:
```sh
 docker-compose up
```
4- Access the interface: Open your browser and navigate to http://localhost:3000 to access the visualization interface.

# Contributors
- Mehmet Emre Sahin
- Sinem Bilge Guler
- Funda Yildiz Aydin

### [Copyright](LICENSE)
