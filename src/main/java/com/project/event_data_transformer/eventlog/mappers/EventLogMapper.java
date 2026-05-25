package com.project.event_data_transformer.eventlog.mappers;

import com.project.event_data_transformer.eventlog.models.EventLogEntity;
import com.project.event_data_transformer.eventlog.models.EventLogModel;

public class EventLogMapper {

    public static EventLogEntity to(EventLogModel model){
        var entity = new EventLogEntity();
        entity.setType(model.type());
        entity.setInputTopic(model.inputTopic());
        entity.setOutputTopic(model.outputTopic());
        entity.setMessage(model.message());
        return entity;
    }

}
