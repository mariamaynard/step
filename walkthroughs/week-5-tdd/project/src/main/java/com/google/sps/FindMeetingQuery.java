// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import static java.util.stream.Collectors.toList;

public final class FindMeetingQuery {
  // method that gets a query with the times that are open for meetings
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    // get the times where the mandatory attendees are busy
    List<TimeRange> busyTimes = busyAttendee(events, request.getAttendees());
    List<TimeRange> busyTimesOptional = busyAttendee(events, request.getOptionalAttendees());
    List<TimeRange> freeTimes = getOpenTimes(busyTimes, request);
    List<TimeRange> freeTimesOptional = getOpenTimes(busyTimesOptional, request);
    freeTimes = intersectOptional(freeTimes, freeTimesOptional, request);
    return freeTimes;
  }

  // method that looks if there is an attendee in the event that is also part of the attendees
  // that we want at the meeting
  public boolean areAttendeesInEvent(Event event, Collection attendees){
    Set<String> eventAttendees = event.getAttendees();
    List<String> result = eventAttendees.stream()
      .distinct()
      .filter(attendees::contains)
      .collect(toList());
    return result.isEmpty();
  }

  // method that returns a list of times that the attendees are busy
  public List<TimeRange> busyAttendee(Collection<Event> events, Collection<String> attendees) {
    List<TimeRange> busyTimes = events
        .stream()
        .filter(event -> !areAttendeesInEvent(event, attendees))
        .map(event -> event.getWhen())
        .sorted(TimeRange.ORDER_BY_START)
        .collect(toList());
    return busyTimes;
  }

  // method that gets the intersect between the mandatory people and the optional people
  public List<TimeRange> intersectOptional(List<TimeRange> mandatory, List<TimeRange> optional, MeetingRequest request) {
    if(request.getAttendees().isEmpty()) {
      return optional;
    }
    if(optional.isEmpty() || optional.get(0).start() == TimeRange.START_OF_DAY && optional.get(0).end() == TimeRange.END_OF_DAY + 1) {
      return mandatory;
    }
    List<TimeRange> intersect = new ArrayList<>();
    int mandIndex = 0;
    int optIndex = 0;
    TimeRange mand;
    TimeRange opt;
    while(mandIndex < mandatory.size() && optIndex < optional.size()) {
      mand = mandatory.get(mandIndex);
      opt = optional.get(optIndex);
      if(mand.overlaps(opt)) {
        if(mand.equals(opt)){
           intersect.add(TimeRange.fromStartEnd(mand.start(), mand.end(), false));
        } else if(mand.start() <= opt.start() && mand.end() <= opt.end()) {
          // this means that the mandatory time starts before the optional time does and ends before the
          // optional time does
          if((mand.end() - opt.start()) >= request.getDuration()) {
            intersect.add(TimeRange.fromStartEnd(opt.start(), mand.end(), false));
          }
        } else if(mand.start() < opt.start()) {
          // the mand starts before and ends after the optional
          intersect.add(TimeRange.fromStartEnd(opt.start(), opt.end(), false));
        } else if(opt.start() < mand.start() && opt.end() >= mand.end()) {
          intersect.add(TimeRange.fromStartEnd(mand.start(), mand.end(), false));
        }
      }
      if(opt.start() < mand.start()) {
        optIndex++;
      } else {
        mandIndex++;
      }
    }
    if (request.getAttendees().isEmpty()) {
      return optional;
    }
    return (intersect.isEmpty() ? mandatory : intersect);
  }

  // method that goes through the busy times to see when there is an open spot to have a meeting
  public List<TimeRange> getOpenTimes(List<TimeRange> busyTimes, MeetingRequest request){
    int start = TimeRange.START_OF_DAY;
    long min = request.getDuration();
    List<TimeRange> free = new ArrayList<>();
    TimeRange newTime;
    TimeRange time;
    TimeRange next;
    boolean overlap;
    // check to make sure the meeting is possible
    if(min <= TimeRange.END_OF_DAY) {
      overlap = false;
      // go through the busy times
      for(int i = 0; i < busyTimes.size(); i++){
        next = null;
        time = busyTimes.get(i);
        if(i != (busyTimes.size() - 1)) {
          next = busyTimes.get(i + 1);
          overlap = time.overlaps(next);
        }
        if(start != time.start() && start < time.start() && (time.start() - start) >= min) {
          if(overlap && time.end() > next.end()){
            // when the current meeting includes the next meeting then we can skip over the next meeting
            i++;
          }
          free.add(TimeRange.fromStartEnd(start, time.start(), false));
        }
        start = time.end();
      }
      // check to see if we need to add a time for the end of the day
      if(start != (TimeRange.END_OF_DAY + 1)) {
        free.add(TimeRange.fromStartEnd(start, TimeRange.END_OF_DAY, true));
      }
    }
    return free;
  }
}
