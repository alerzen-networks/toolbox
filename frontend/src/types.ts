export interface Monitor {
    id: number;
    name: string;
    url: string;
    interval: number;
    type: string;
    check_ssl: boolean;
    ssl_expiry?: string;
    last_check?: Check;
    checks?: Check[];
}

export interface Check {
    id: number;
    monitor_id: number;
    status_code: number;
    duration: number; // in ms
    output?: string;
    created_at: string;
}

export interface MonitorStatus {
    monitors: Monitor[];
}
