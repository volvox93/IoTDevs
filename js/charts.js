var chartTheseColumns = function(bindTarget, columns){
	var chart = c3.generate({
        bindto: bindTarget,
        data: {
            x: 'x',
            xFormat: '%Y-%d-%m %H:%M:%S',
            columns: columns,
            type: 'area'
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%y-%m-%d %H:%M:%S'
                }
            }
        }
    });
}