package com.orange.spring.demo.biz.view.model;

/*
 * #%L
 * Spring demo
 * %%
 * Copyright (C) 2016 Orange
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 2 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-2.0.html>.
 * #L%
 */


import com.orange.spring.demo.biz.domain.Community;
import com.orange.spring.demo.biz.domain.User;
import lombok.Getter;

import java.util.List;

@Getter
public class UserProfileView {
  private final User user;
  private final List<Long> userCommunitiesIds;
  private final List<Community> allCommunities;

  public UserProfileView(User userWithoutCommunities) {
    user = userWithoutCommunities.loadCommunities();
    this.userCommunitiesIds = user.communitiesIds();
    this.allCommunities = user.communityService.all().asList();
  }
}
