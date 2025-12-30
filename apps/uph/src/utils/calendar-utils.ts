
export const generateGoogleCalendarLink = (title: string, description?: string, dueDate?: Date | string) => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    
    // Default to "Tomorrow at 9 AM" if no date provided
    let start = new Date();
    if (dueDate) {
        start = new Date(dueDate);
    } else {
        start.setDate(start.getDate() + 1);
        start.setHours(9, 0, 0, 0);
    }
    
    // End time = Start + 1 hour
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const details = encodeURIComponent(description || "Proje görevi");
    const text = encodeURIComponent(title);
    const dates = `${formatDate(start)}/${formatDate(end)}`;

    return `${baseUrl}&text=${text}&details=${details}&dates=${dates}`;
};
